
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Billing } from '../billings/entities/billing.entity';
import { BillingStatus, BillingType } from '../billings/enums/billing.enum';
import { PaymentMethodsService } from '../settings/payment-methods/payment-methods.service';
import Stripe from 'stripe';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { UsersService } from '../users/users.service';
import { BillingsService } from '../billings/billings.service';
import { CreateBillingDto } from '../billings/dto/create-billing.dto';

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

      // Handle checkout session completed
      if (event.type === 'checkout.session.completed') {
        this.logger.log(`Processing checkout.session.completed event for session: ${event.data.object.id}`);
        this.logger.debug(`Session object: ${JSON.stringify(event.data.object)}`);

        const session = event.data.object;
        this.logger.log(`Processing checkout session completed for session: ${session.id}`);
      }

      // Handle payment intent succeeded
      if (event.type === 'payment_intent.succeeded') {
        this.logger.log(`Processing payment_intent.succeeded event for payment intent: ${event.data.object.id}`);
        await this.handleSetupIntentSuccess(event.data.object);

      }

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

      // Handle setup intent succeeded
      if (event.type === 'setup_intent.succeeded') {
        this.logger.log(`Processing setup_intent.succeeded event for setup intent: ${event.data.object.id}`);
        await this.handleSetupIntentSucceeded(event.data.object);
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
        where: { stripeInvoiceId: invoice.id },
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



  async checkAndCreatePaymentSession({
    customerId,
    invoiceId,
    successUrl,
    cancelUrl
  }: {
    customerId: string;
    invoiceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<string> {
    await this.ensureStripeInitialized();

    try {
      // Check if customer has default payment method
      const customer = await this.stripe.customers.retrieve(customerId);

      if (customer.invoice_settings?.default_payment_method) {
        // Customer has default payment method, use hosted invoice URL
        const invoice = await this.stripe.invoices.retrieve(invoiceId);
        return invoice.hosted_invoice_url!;

      } else {
        // No default payment method, create setup intent checkout session
        const session = await this.stripe.checkout.sessions.create({
          mode: 'setup',
          payment_method_types: ['card'],
          customer: customerId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            invoiceId: invoiceId,
            type: 'setup_intent'
          },
        });

        return session.url!;

      }
    } catch (error) {
      this.logger.error(`Error checking/creating setup session:`, error.message);
      throw new BadRequestException(`Failed to create setup session: ${error.message}`);
    }
  }


  async handleSetupIntentSuccess(paymentIntent: any): Promise<void> {
    this.logger.log(`Processing payment intent success for payment intent: ${paymentIntent.id}`);

    try {
      const { customerId } = paymentIntent.metadata;

      if (!customerId) {
        this.logger.error(`No    ID found in payment intent metadata: ${paymentIntent.id}`);
        return;
      }

      if (paymentIntent.payment_method) {
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentIntent.payment_method as string,
          },
        });

        this.logger.log(`Set default payment method ${paymentIntent.payment_method} for customer ${customerId}`);
      }


    } catch (error) {
      this.logger.error(`Error handling payment intent success for payment intent ${paymentIntent.id}:`, error.message);
      throw error;
    }
  }

  async handleSetupIntentSucceeded(setupIntent: any): Promise<void> {
    this.logger.log(`Processing setup intent success for setup intent: ${setupIntent.id}`);

    try {
      const { customer } = setupIntent;

      if (!customer) {
        this.logger.error(`No customer found in setup intent: ${setupIntent.id}`);
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

      // Update user with Stripe customer ID
      await this.dataSource.manager.update(User, user.id, {
        stripeCustomerId: customer
      });

      this.logger.log(`Updated user ${user.id} with Stripe customer ID: ${customer}`);

    } catch (error) {
      this.logger.error(`Error handling setup intent success for setup intent ${setupIntent.id}:`, error.message);
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
        where: { stripeInvoiceId: invoice.id }
      });

      if (billing) {
        await this.dataSource.manager.update(Billing, billing.id, {
          status: BillingStatus.PAID
        });
        this.logger.log(`Updated billing record ${billing.id} status to PAID for invoice: ${invoice.id}`);
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
        where: { stripeInvoiceId: invoice.id }
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



}
