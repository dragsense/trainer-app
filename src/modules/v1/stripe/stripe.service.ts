
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Billing } from '../billings/entities/billing.entity';
import { BillingStatus, BillingType, BillingCurrency } from '../billings/enums/billing.enum';
import { PaymentMethodsService } from '../settings/payment-methods/payment-methods.service';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { CreateBillingDto } from '../billings/dto/create-billing.dto';
import { UserRole, UserLevels } from '../users/enums/user.enum';
import { StripeConnectAccount } from '../settings/stripe-connect/entities/stripe-connect-account.entity';
import { PaymentMethodType } from '../settings/payment-methods/enums/payment-method-type.enum';
import { PaymentMethod } from '../settings/payment-methods/entities/payment-method.entity';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: any;
  private stripeConfig: { secretKey: string; webhookSecret?: string; publishableKey: string } | null = null;

  constructor(
    private readonly dataSource: DataSource,
    private readonly paymentMethodsService: PaymentMethodsService,
  ) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.logger.log('Initializing Stripe service...');
      this.stripeConfig = await this.paymentMethodsService.getStripeConfig();

      if (this.stripeConfig?.secretKey) {
        this.stripe = new Stripe(this.stripeConfig.secretKey);
        this.logger.log('Stripe initialized successfully with database configuration');
      } else {
        this.logger.warn('Stripe not configured in payment methods settings or package not installed');
        this.stripe = null;
      }
    } catch (error) {
      this.logger.error('Error initializing Stripe:', error.message);
      this.stripe = null;
    }
  }

  private async ensureStripeInitialized() {
    if (!this.stripe || !this.stripeConfig) {
      this.logger.log('Stripe not initialized, attempting to initialize...');
      await this.initializeStripe();
    }

    if (!this.stripe) {
      this.logger.error('Stripe initialization failed - service not available');
      throw new BadRequestException(
        'Stripe is not configured. Please configure Stripe in Payment Methods settings or install stripe package.'
      );
    }
  }





  async handleWebhook(payload: Buffer, signature: string): Promise<any> {
    this.logger.log('Processing Stripe webhook...');

    if (!payload) {
      this.logger.error('No payload received in webhook');
      throw new BadRequestException('No payload received in webhook');
    }

    this.logger.debug(`Webhook payload size: ${payload.length} bytes`);
    this.logger.debug(`Webhook signature: ${signature}`);

    await this.ensureStripeInitialized();

    const webhookSecret = this.stripeConfig?.webhookSecret;

    if (!webhookSecret) {
      this.logger.error('Webhook secret not configured in payment methods settings');
      throw new BadRequestException('Webhook secret not configured in payment methods settings');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      this.logger.log(`Webhook event received: ${event.type} (ID: ${event.id})`);
      this.logger.debug(`Event data: ${JSON.stringify(event.data)}`);


      // Handle invoice payment succeeded
      if (event.type === 'invoice.payment_succeeded') {
        this.logger.log(`Processing invoice.payment_succeeded event for invoice: ${event.data.object.id}`);
        const invoice = event.data.object;
        await this.handleInvoicePaymentSucceeded(invoice);

      }

      // Handle invoice payment failed
      if (event.type === 'invoice.payment_failed') {
        this.logger.log(`Processing invoice.payment_failed event for invoice: ${event.data.object.id}`);
        const invoice = event.data.object;
        await this.handleInvoicePaymentFailed(invoice);
      }




      // Handle invoice created
      if (event.type === 'invoice.finalized') {
        this.logger.log(`Processing invoice.finalized event for invoice: ${event.data.object.id}`);
        this.logger.debug(`Invoice object: ${JSON.stringify(event.data.object)}`);
        await this.handleInvoiceFinalized(event.data.object);
      }

      // Handle invoice updated (for status changes)
      if (event.type === 'invoice.updated') {
        this.logger.log(`Processing invoice.updated event for invoice: ${event.data.object.id}`);
        this.logger.debug(`Invoice object: ${JSON.stringify(event.data.object)}`);
        await this.handleInvoiceUpdated(event.data.object);
      }

      // Handle customer created
      if (event.type === 'customer.created') {
        this.logger.log(`Processing customer.created event for customer: ${event.data.object.id}`);
        this.logger.debug(`Customer object: ${JSON.stringify(event.data.object)}`);
        await this.handleCustomerCreated(event.data.object);
      }

      this.logger.log(`Webhook processed successfully: ${event.type}`);
      return event;
    } catch (error) {
      this.logger.error('Webhook signature verification failed:', error.message);
      this.logger.error('Webhook error details:', error);
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }
  }


  private async handleInvoiceFinalized(invoice: any): Promise<void> {
    this.logger.log(`Processing invoice finalized for invoice: ${invoice.id}`);

    try {
      const { metadata } = invoice;


      if (metadata?.billingId) {
        this.logger.error(`No Billing found in invoice: ${invoice.id}`)
        return;
      }

      const existingBilling = await this.dataSource.manager.findOne(Billing, {
        where: { id: metadata.billingId },
      });

      if (!existingBilling) {
        this.logger.log(`No Billing record found for ID: ${metadata?.billingId}`);
        return;
      }

      await this.dataSource.manager.update(Billing, existingBilling.id, {
        stripeInvoiceId: invoice.id,
      });


    } catch (error) {
      this.logger.error(`Error handling invoice finalized for ${invoice.id}: ${error.message}`);
      throw error;
    }
  }



  private async handleInvoiceUpdated(invoice: any): Promise<void> {
    this.logger.log(`Processing invoice updated for invoice: ${invoice.id}`);

    try {
      // Find billing record for this invoice
      const billing = await this.dataSource.manager.findOne(Billing, {
        where: { stripeInvoiceId: invoice.id }
      });

      if (!billing) {
        this.logger.warn(`No billing record found for invoice: ${invoice.id}`);
        return;
      }

      // Update billing status based on invoice status
      let newStatus: BillingStatus;
      switch (invoice.status) {
        case 'paid':
          newStatus = BillingStatus.PAID;
          break;
        case 'open':
          newStatus = BillingStatus.PENDING;
          break;
        case 'void':
        case 'uncollectible':
          newStatus = BillingStatus.FAILED;
          break;
        case 'draft':
        default:
          newStatus = BillingStatus.PENDING;
          break;
      }

      // Update billing record
      await this.dataSource.manager.update(Billing, billing.id, {
        status: newStatus,
        invoiceAmount: invoice.amount_due,
        currency: invoice.currency,
      });

      this.logger.log(`Updated billing record ${billing.id} status to ${newStatus} for invoice: ${invoice.id}`);
    } catch (error) {
      this.logger.error(`Error handling invoice updated for invoice ${invoice.id}:`, error.message);
      throw error;
    }
  }

  private async handleCustomerCreated(customer: any): Promise<void> {
    this.logger.log(`Processing customer created for customer: ${customer.id}`);

    try {
      const { email, metadata } = customer;

      if (!email) {
        this.logger.error(`No email found in customer: ${customer.id}`);
        return;
      }

      // Find user by email
      const user = await this.dataSource.manager.findOne(User, {
        where: { email: email }
      });

      if (!user) {
        this.logger.warn(`No user found for email: ${email}`);
        return;
      }

      // Update user with Stripe customer ID
      await this.dataSource.manager.update(User, user.id, {
        stripeCustomerId: customer.id
      });

      this.logger.log(`Updated user ${user.id} with Stripe customer ID: ${customer.id}`);
    } catch (error) {
      this.logger.error(`Error handling customer created for customer ${customer.id}:`, error.message);
      throw error;
    }
  }


  async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    this.logger.log(`Processing invoice payment succeeded for invoice: ${invoice.id}`);

    try {
      const { customer, payment_intent } = invoice;

      if (!customer) {
        this.logger.error(`No customer found in invoice: ${invoice.id}`);
        return;
      }

      // Find user by Stripe customer ID
      const user = await this.dataSource.manager.findOne(User, {
        where: { stripeCustomerId: customer }
      });

      if (!user) {
        this.logger.warn(`No user found for Stripe customer: ${customer}`);
        return;
      }

      // Update payment method if payment intent has one
      if (payment_intent && payment_intent.payment_method) {
        await this.stripe.customers.update(customer, {
          invoice_settings: {
            default_payment_method: payment_intent.payment_method as string,
          },
        });
        this.logger.log(`Updated default payment method for customer ${customer}`);
      }

      // Update billing record status to paid
      const billing = await this.dataSource.manager.findOne(Billing, {
        where: { stripeInvoiceId: invoice.id },
        relations: ['session', 'session.trainer', 'paymentMethod', 'creator']
      });

      if (billing) {
        await this.dataSource.manager.update(Billing, billing.id, {
          status: BillingStatus.PAID
        });
        this.logger.log(`Updated billing record ${billing.id} status to PAID for invoice: ${invoice.id}`);

        let trainer;
        if (billing.creator?.level === UserLevels[UserRole.TRAINER]) {
          trainer = billing.creator
        } else
          if (billing.session?.trainer) {
            trainer = billing.session.trainer
          }

        // Try to transfer payment to trainer's Stripe Connect account (if session has trainer)
        if (trainer) {
          const transferResult = await this.transferToTrainerAccount(
            trainer,
            invoice.amount_paid,
            `Invoice Payment - ${billing.id}`
          );

          if (transferResult.success) {
            this.logger.log(`Successfully transferred payment to trainer ${trainer.email}`);
            // Optionally update billing record with transfer ID
            await this.dataSource.manager.update(Billing, billing.id, {
              notes: `Transfer ID: ${transferResult.transferId}`
            });
          } else {
            this.logger.warn(`Failed to transfer to trainer: ${transferResult.error}`);
          }

          await this.createTrainerPaymentInvoice(
            trainer,
            invoice.amount_paid,
            billing,
            transferResult.success ? BillingStatus.PAID : BillingStatus.PENDING,
            `Transfer failed - ${billing.id}. Error: ${transferResult.error}`
          );
        }
      } else {
        this.logger.warn(`No billing record found for invoice: ${invoice.id}`);
      }



      this.logger.log(`Successfully processed invoice payment for invoice: ${invoice.id}`);

    } catch (error) {
      this.logger.error(`Error handling invoice payment succeeded for invoice ${invoice.id}:`, error.message);
      throw error;
    }
  }

  async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    this.logger.log(`Processing invoice payment failed for invoice: ${invoice.id}`);

    try {
      const { customer } = invoice;

      if (!customer) {
        this.logger.error(`No customer found in invoice: ${invoice.id}`);
        return;
      }

      // Find user by Stripe customer ID
      const user = await this.dataSource.manager.findOne(User, {
        where: { stripeCustomerId: customer }
      });

      if (!user) {
        this.logger.warn(`No user found for Stripe customer: ${customer}`);
        return;
      }

      // Update billing record status to failed
      const billing = await this.dataSource.manager.findOne(Billing, {
        where: { stripeInvoiceId: invoice.id },
        relations: ['session', 'session.trainer']
      });

      if (billing) {
        await this.dataSource.manager.update(Billing, billing.id, {
          status: BillingStatus.FAILED
        });
        this.logger.log(`Updated billing record ${billing.id} status to FAILED for invoice: ${invoice.id}`);

      } else {
        this.logger.warn(`No billing record found for failed invoice: ${invoice.id}`);
      }

      this.logger.log(`Successfully processed invoice payment failed for invoice: ${invoice.id}`);

    } catch (error) {
      this.logger.error(`Error handling invoice payment failed for invoice ${invoice.id}:`, error.message);
      throw error;
    }
  }


  private async findAdminUser(): Promise<User> {
    const admin = await this.dataSource.manager.findOne(User, {
      where: { level: UserLevels[UserRole.SUPER_ADMIN] }
    });

    if (!admin) {
      // Fallback to super admin if no admin found
      const superAdmin = await this.dataSource.manager.findOne(User, {
        where: { level: UserLevels[UserRole.SUPER_ADMIN] }
      });

      if (!superAdmin) {
        throw new Error('No admin user found in system');
      }

      return superAdmin;
    }

    return admin;
  }

  private async getPlatformFeePercentage(): Promise<number> {
    try {
      return 2
    } catch (error) {
      this.logger.warn('Failed to get platform fee from settings, using default 2%:', error.message);
      return 2; // Fallback to 2% if settings not available
    }
  }


  private async calculatePlatformFee(amount: number): Promise<{ platformFeeAmount: number; platformFeePercentage: number }> {
    const platformFeePercentage = await this.getPlatformFeePercentage();
    const platformFeeAmount = Math.round(amount * (platformFeePercentage / 100));

    return {
      platformFeeAmount,
      platformFeePercentage
    };
  }

  private async createTrainerPaymentInvoice(
    trainer: User,
    amount: number,
    originalBilling: Billing,
    status: BillingStatus,
    description: string
  ): Promise<void> {
    try {
      const admin = await this.findAdminUser();

      // Calculate platform fee dynamically
      const { platformFeeAmount, platformFeePercentage } = await this.calculatePlatformFee(amount);
      const trainerAmount = amount - platformFeeAmount;

    const localInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;


      const createDto = {
        type: BillingType.INDIVIDUAL,
        user: admin, // Invoice against admin
        status: status,
        currency: originalBilling.currency || BillingCurrency.USD,
        paymentMethod: originalBilling.paymentMethod,
        lineItems: [
          {
            description: `Trainer Payment: ${description}`,
            quantity: 1,
            unitPrice: trainerAmount,
            amount: trainerAmount,
            tax: 0
          }
        ],
        totalTax: 0,
        discount: 0,
        totalAmount: trainerAmount,
        invoiceAmount: trainerAmount,
        notes: `Payment to trainer ${trainer.email} for ${description}. Original amount: ${amount / 100}. Platform fee (${platformFeePercentage}%): ${platformFeeAmount / 100}. Net to trainer: ${trainerAmount / 100}`,
        terms: 'Due on demand',
        localInvoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      await this.dataSource.manager.save(Billing, createDto);

      this.logger.log(`Created ${status} invoice against admin for trainer ${trainer.email}, amount: ${trainerAmount / 100} (${platformFeePercentage}% platform fee: ${platformFeeAmount / 100})`);
    } catch (error) {
      this.logger.error(`Error creating trainer payment invoice:`, error.message);
      // Don't throw - this shouldn't break the main payment flow
    }
  }

  private async transferToTrainerAccount(
    trainer: User,
    amount: number,
    description: string
  ): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      await this.ensureStripeInitialized();

      // Find trainer's Stripe Connect account
      const connectAccount = await this.dataSource.manager.findOne(StripeConnectAccount, {
        where: { userId: trainer.id }
      });

      if (!connectAccount) {
        return {
          success: false,
          error: `No Stripe Connect account found for trainer ${trainer.email}`
        };
      }

      if (!connectAccount.chargesEnabled || !connectAccount.detailsSubmitted) {
        return {
          success: false,
          error: `Trainer ${trainer.email} Stripe Connect account not fully activated`
        };
      }

      // Calculate platform fee dynamically
      const { platformFeeAmount, platformFeePercentage } = await this.calculatePlatformFee(amount);
      const trainerAmount = amount - platformFeeAmount;

      // Create transfer to trainer's connected account
      const transfer = await this.stripe!.transfers.create({
        amount: trainerAmount,
        currency: 'usd',
        destination: connectAccount.stripeAccountId,
        description: description,
        metadata: {
          trainerId: trainer.id.toString(),
          trainerEmail: trainer.email,
          originalAmount: amount.toString(),
          platformFee: platformFeeAmount.toString(),
          platformFeePercentage: platformFeePercentage.toString()
        }
      });

      this.logger.log(`Successfully transferred ${trainerAmount / 100} to trainer ${trainer.email} (${connectAccount.stripeAccountId}) with ${platformFeePercentage}% platform fee`);

      return {
        success: true,
        transferId: transfer.id
      };

    } catch (error) {
      this.logger.error(`Error transferring to trainer account:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }


}
