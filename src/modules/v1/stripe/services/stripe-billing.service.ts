/* eslint-disable prettier/prettier */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentMethodsService } from '@/modules/v1/settings/payment-methods/payment-methods.service';
import Stripe from 'stripe';
import { User } from '@/modules/v1//users/entities/user.entity';
import { StripeInvoiceService } from './stripe-invoice.service';
import { StripeTransactionService } from './stripe-transaction.service';

@Injectable()
export class StripeBillingService {
  private readonly logger = new Logger(StripeBillingService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly paymentMethodsService: PaymentMethodsService,
    private readonly stripeInvoiceService: StripeInvoiceService,
    private readonly stripeTransactionService: StripeTransactionService,
  ) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.logger.log('Initializing Stripe billing service...');
      const stripeConfig = await this.paymentMethodsService.getStripeConfig();

      if (stripeConfig?.secretKey) {
        this.stripe = new Stripe(stripeConfig.secretKey);
        this.logger.log('Stripe billing service initialized successfully');
      } else {
        this.logger.warn('Stripe not configured in payment methods settings');
        this.stripe = null;
      }
    } catch (error) {
      this.logger.error('Error initializing Stripe billing service:', error.message);
      this.stripe = null;
    }
  }

  private async ensureStripeInitialized() {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured. Please configure Stripe in Payment Methods settings.');
    }
  }

  async createCustomer(
    email: string,
    name?: string,
    phone?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Customer> {
    await this.ensureStripeInitialized();

    try {
      const customerData: Stripe.CustomerCreateParams = {
        email,
        metadata,
      };

      if (name) {
        customerData.name = name;
      }

      if (phone) {
        customerData.phone = phone;
      }

      const customer = await this.stripe!.customers.create(customerData);
      this.logger.log(`Created customer ${customer.id} with email ${email}`);

      return customer;
    } catch (error) {
      this.logger.error(`Error creating customer with email ${email}:`, error.message);
      throw new BadRequestException(`Failed to create customer: ${error.message}`);
    }
  }

  async getCustomer(customerId: string): Promise<any> {
    await this.ensureStripeInitialized();

    try {
      const customer = await this.stripe!.customers.retrieve(customerId, {
        expand: ['invoice_settings.default_payment_method'],
      });

      const subscriptions = await this.stripe!.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 2,
        expand: ['data.plan.product'],
      });

      return {
        ...customer,
        subscriptions,
      };
    } catch (error) {
      this.logger.error(`Error retrieving customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve customer: ${error.message}`);
    }
  }

  async updateCustomer(
    customerId: string,
    updates: {
      email?: string;
      name?: string;
      phone?: string;
      metadata?: Record<string, string>;
    },
  ): Promise<Stripe.Customer> {
    await this.ensureStripeInitialized();

    try {
      const updateData: Stripe.CustomerUpdateParams = {};

      if (updates.email) {
        updateData.email = updates.email;
      }

      if (updates.name) {
        updateData.name = updates.name;
      }

      if (updates.phone) {
        updateData.phone = updates.phone;
      }

      if (updates.metadata) {
        updateData.metadata = updates.metadata;
      }

      const customer = await this.stripe!.customers.update(customerId, updateData);
      this.logger.log(`Updated customer ${customerId}`);

      return customer;
    } catch (error) {
      this.logger.error(`Error updating customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to update customer: ${error.message}`);
    }
  }

  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    await this.ensureStripeInitialized();

    try {
      const deletedCustomer = await this.stripe!.customers.del(customerId);
      this.logger.log(`Deleted customer ${customerId}`);

      return deletedCustomer;
    } catch (error) {
      this.logger.error(`Error deleting customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to delete customer: ${error.message}`);
    }
  }

  async listCustomers(limit: number = 100): Promise<Stripe.ApiList<Stripe.Customer>> {
    await this.ensureStripeInitialized();

    try {
      const customers = await this.stripe!.customers.list({
        limit,
        expand: ['data.subscriptions', 'data.invoice_settings.default_payment_method'],
      });

      return customers;
    } catch (error) {
      this.logger.error('Error listing customers:', error.message);
      throw new BadRequestException(`Failed to list customers: ${error.message}`);
    }
  }

  async createPaymentMethod(
    type: string,
    card?: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    },
    billingDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    },
  ): Promise<Stripe.PaymentMethod> {
    await this.ensureStripeInitialized();

    try {
      const paymentMethodData: Stripe.PaymentMethodCreateParams = {
        type: type as Stripe.PaymentMethodCreateParams.Type,
      };

      if (card) {
        paymentMethodData.card = card;
      }

      if (billingDetails) {
        paymentMethodData.billing_details = billingDetails;
      }

      const paymentMethod = await this.stripe!.paymentMethods.create(paymentMethodData);
      this.logger.log(`Created payment method ${paymentMethod.id}`);

      return paymentMethod;
    } catch (error) {
      this.logger.error('Error creating payment method:', error.message);
      throw new BadRequestException(`Failed to create payment method: ${error.message}`);
    }
  }

  async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string,
  ): Promise<Stripe.PaymentMethod> {
    await this.ensureStripeInitialized();

    try {
      const paymentMethod = await this.stripe!.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      this.logger.log(`Attached payment method ${paymentMethodId} to customer ${customerId}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Error attaching payment method ${paymentMethodId} to customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to attach payment method: ${error.message}`);
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    await this.ensureStripeInitialized();

    try {
      const paymentMethod = await this.stripe!.paymentMethods.detach(paymentMethodId);
      this.logger.log(`Detached payment method ${paymentMethodId}`);

      return paymentMethod;
    } catch (error) {
      this.logger.error(`Error detaching payment method ${paymentMethodId}:`, error.message);
      throw new BadRequestException(`Failed to detach payment method: ${error.message}`);
    }
  }

  async getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    await this.ensureStripeInitialized();

    try {
      const paymentMethod = await this.stripe!.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      this.logger.error(`Error retrieving payment method ${paymentMethodId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve payment method: ${error.message}`);
    }
  }

  async listCustomerPaymentMethods(
    customerId: string,
    type?: string,
    limit: number = 100,
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.PaymentMethodListParams = {
        customer: customerId,
        limit,
      };

      if (type) {
        params.type = type as Stripe.PaymentMethodListParams.Type;
      }

      const paymentMethods = await this.stripe!.paymentMethods.list(params);
      return paymentMethods;
    } catch (error) {
      this.logger.error(`Error listing payment methods for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to list payment methods: ${error.message}`);
    }
  }

  async setDefaultPaymentMethod(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Customer> {
    await this.ensureStripeInitialized();

    try {
      const customer = await this.stripe!.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      this.logger.log(`Set default payment method ${paymentMethodId} for customer ${customerId}`);
      return customer;
    } catch (error) {
      this.logger.error(`Error setting default payment method for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to set default payment method: ${error.message}`);
    }
  }

  async createSetupIntent(
    customerId: string,
    paymentMethodTypes: string[] = ['card'],
    metadata?: Record<string, string>,
  ): Promise<Stripe.SetupIntent> {
    await this.ensureStripeInitialized();

    try {
      const setupIntentData: Stripe.SetupIntentCreateParams = {
        customer: customerId,
        payment_method_types: paymentMethodTypes as Stripe.PaymentMethod.Type[],
        metadata,
      };

      const setupIntent = await this.stripe!.setupIntents.create(setupIntentData);
      this.logger.log(`Created setup intent ${setupIntent.id} for customer ${customerId}`);

      return setupIntent;
    } catch (error) {
      this.logger.error(`Error creating setup intent for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to create setup intent: ${error.message}`);
    }
  }

  async getSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent> {
    await this.ensureStripeInitialized();

    try {
      const setupIntent = await this.stripe!.setupIntents.retrieve(setupIntentId, {
        expand: ['customer', 'payment_method'],
      });

      return setupIntent;
    } catch (error) {
      this.logger.error(`Error retrieving setup intent ${setupIntentId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve setup intent: ${error.message}`);
    }
  }

  async confirmSetupIntent(
    setupIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.SetupIntent> {
    await this.ensureStripeInitialized();

    try {
      const confirmData: Stripe.SetupIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      const setupIntent = await this.stripe!.setupIntents.confirm(setupIntentId, confirmData);
      this.logger.log(`Confirmed setup intent ${setupIntentId}`);

      return setupIntent;
    } catch (error) {
      this.logger.error(`Error confirming setup intent ${setupIntentId}:`, error.message);
      throw new BadRequestException(`Failed to confirm setup intent: ${error.message}`);
    }
  }

  async cancelSetupIntent(setupIntentId: string): Promise<Stripe.SetupIntent> {
    await this.ensureStripeInitialized();

    try {
      const setupIntent = await this.stripe!.setupIntents.cancel(setupIntentId);
      this.logger.log(`Canceled setup intent ${setupIntentId}`);

      return setupIntent;
    } catch (error) {
      this.logger.error(`Error canceling setup intent ${setupIntentId}:`, error.message);
      throw new BadRequestException(`Failed to cancel setup intent: ${error.message}`);
    }
  }

  async getBillingPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    await this.ensureStripeInitialized();

    try {
      const session = await this.stripe!.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      this.logger.log(`Created billing portal session for customer ${customerId}`);
      return session;
    } catch (error) {
      this.logger.error(`Error creating billing portal session for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to create billing portal session: ${error.message}`);
    }
  }

  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    await this.ensureStripeInitialized();

    try {
      const session = await this.stripe!.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      this.logger.error(`Error retrieving checkout session ${sessionId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve checkout session: ${error.message}`);
    }
  }

  async createSetupCheckoutSession(
    setupIntentId: string,
    successUrl: string,
    cancelUrl: string,
    customerId?: string,
  ): Promise<Stripe.Checkout.Session> {
    await this.ensureStripeInitialized();

    try {
      const sessionData: Stripe.Checkout.SessionCreateParams = {
        mode: 'setup',
        setup_intent_data: {
          metadata: {
            setup_intent_id: setupIntentId,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        payment_method_types: ['card'],
      };

      // Add customer information if provided
      if (customerId) {
        sessionData.customer = customerId;
      }

      const session = await this.stripe!.checkout.sessions.create(sessionData);

      this.logger.log(`Created setup checkout session for setup intent ${setupIntentId}`);
      return session;
    } catch (error) {
      this.logger.error(`Error creating setup checkout session for setup intent ${setupIntentId}:`, error.message);
      throw new BadRequestException(`Failed to create setup checkout session: ${error.message}`);
    }
  }

  async checkPendingBillings(customerId: string): Promise<boolean> {
    this.logger.log(`Checking for pending billings for customer: ${customerId}`);

    try {
      // Check for pending payment intents
      const paymentIntents = await this.stripeTransactionService.listPaymentIntents(customerId);
      const hasPendingPaymentIntents = paymentIntents.data.some(intent =>
        intent.status === 'requires_payment_method' ||
        intent.status === 'requires_confirmation' ||
        intent.status === 'requires_action'
      );

      // Check for pending invoices
      const invoices = await this.stripeInvoiceService.listInvoices(customerId, undefined, 'open');
      const hasPendingInvoices = invoices.data.length > 0;



      const hasPendingBillings = hasPendingPaymentIntents || hasPendingInvoices;

      this.logger.log(`Pending billings check for customer ${customerId}: ${hasPendingBillings ? 'Found pending billings' : 'No pending billings'}`);

      return hasPendingBillings;
    } catch (error) {
      this.logger.error(`Error checking pending billings for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to check pending billings: ${error.message}`);
    }
  }



  async createOrGetStripeCustomer(user: User): Promise<string> {
    this.logger.log(`Creating or retrieving Stripe customer for user: ${user.email} (ID: ${user.id})`);

    await this.ensureStripeInitialized();

    if (user.stripeCustomerId) {
      this.logger.debug(`User has existing Stripe customer ID: ${user.stripeCustomerId}`);
      try {
        const existingCustomer = await this.stripe!.customers.retrieve(user.stripeCustomerId);

        if (!existingCustomer.deleted) {
          this.logger.log(`Retrieved existing Stripe customer: ${existingCustomer.id}`);
          return existingCustomer.id;
        } else {
          this.logger.warn(`Existing Stripe customer ${user.stripeCustomerId} is deleted`);
        }
      } catch (error) {
        this.logger.warn(`Stripe customer ID ${user.stripeCustomerId} invalid or deleted. Creating new customer.`, error.message);
      }
    }

    try {
      const customers = await this.stripe!.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        const found = customers.data[0];
        this.logger.log(`Found existing Stripe customer by email: ${found.id}`);

        return found.id;
      }
    } catch (error) {
      this.logger.warn(`Failed to search Stripe customer by email:`, error.message);
    }

    try {
      const customer = await this.stripe!.customers.create({
        name: `${user.profile?.firstName} ${user.profile?.lastName}`,
        email: user.email,
        metadata: {
          userId: user.id.toString(),
        },
      });

      this.logger.log(`Created new Stripe customer: ${customer.id} for user ${user.id}`);
      return customer.id;
    } catch (error) {
      this.logger.error(`Failed to create Stripe customer for user ${user.id}:`, error.message);
      throw new BadRequestException(`Failed to create Stripe customer: ${error.message}`);
    }
  }
} 