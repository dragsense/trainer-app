/* eslint-disable prettier/prettier */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentMethodsService } from '@/modules/v1//settings/payment-methods/payment-methods.service';
import Stripe from 'stripe';

@Injectable()
export class StripeTransactionService {
  private readonly logger = new Logger(StripeTransactionService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly paymentMethodsService: PaymentMethodsService) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.logger.log('Initializing Stripe transaction service...');
      const stripeConfig = await this.paymentMethodsService.getStripeConfig();

      if (stripeConfig?.secretKey) {
        this.stripe = new Stripe(stripeConfig.secretKey);
        this.logger.log('Stripe transaction service initialized successfully');
      } else {
        this.logger.warn('Stripe not configured in payment methods settings');
        this.stripe = null;
      }
    } catch (error) {
      this.logger.error('Error initializing Stripe transaction service:', error.message);
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

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    paymentMethodId?: string,
    metadata?: Record<string, string>,
    description?: string,
  ): Promise<Stripe.PaymentIntent> {
    await this.ensureStripeInitialized();

    try {
      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        metadata,
        description,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (paymentMethodId) {
        paymentIntentData.payment_method = paymentMethodId;
        paymentIntentData.confirm = true;
      }

      const paymentIntent = await this.stripe!.paymentIntents.create(paymentIntentData);
      this.logger.log(`Created payment intent ${paymentIntent.id} for customer ${customerId}`);

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error creating payment intent for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to create payment intent: ${error.message}`);
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    await this.ensureStripeInitialized();

    try {
      const paymentIntent = await this.stripe!.paymentIntents.retrieve(paymentIntentId, {
        expand: ['customer', 'payment_method'],
      });

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error retrieving payment intent ${paymentIntentId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  async listPaymentIntents(
    customerId?: string,
    limit: number = 100,
  ): Promise<Stripe.ApiList<Stripe.PaymentIntent>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.PaymentIntentListParams = {
        limit,
        expand: ['data.customer', 'data.payment_method'],
      };

      if (customerId) {
        params.customer = customerId;
      }

      const paymentIntents = await this.stripe!.paymentIntents.list(params);
      return paymentIntents;
    } catch (error) {
      this.logger.error('Error listing payment intents:', error.message);
      throw new BadRequestException(`Failed to list payment intents: ${error.message}`);
    }
  }

  async listPaymentIntentsWithFilters(filters: {
    search?: string;
    status?: string;
    customerId?: string;
    currency?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentIntentId?: string;
    chargeId?: string;
    createdDateFrom?: string;
    createdDateTo?: string;
    capturedDateFrom?: string;
    capturedDateTo?: string;
    limit?: number;
  }): Promise<Stripe.ApiList<Stripe.PaymentIntent>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.PaymentIntentListParams = {
        limit: filters.limit || 100,
        expand: ['data.customer', 'data.payment_method'],
      };

      // Apply filters
      if (filters.customerId) {
        params.customer = filters.customerId;
      }

      // Get all payment intents first (Stripe doesn't support complex filtering)
      const paymentIntents = await this.stripe!.paymentIntents.list(params);
      
      // Apply client-side filtering for fields not supported by Stripe API
      let filteredPaymentIntents = paymentIntents.data;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.id.toLowerCase().includes(searchTerm) ||
          (pi.description && pi.description.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.status) {
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.status === filters.status
        );
      }

      if (filters.currency) {
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.currency === filters.currency
        );
      }

      if (filters.minAmount !== undefined) {
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.amount >= filters.minAmount!
        );
      }

      if (filters.maxAmount !== undefined) {
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.amount <= filters.maxAmount!
        );
      }

      if (filters.paymentIntentId) {
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.id.includes(filters.paymentIntentId!)
        );
      }

      if (filters.chargeId) {
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.charges?.data?.some(charge => charge.id.includes(filters.chargeId!))
        );
      }

      if (filters.createdDateFrom) {
        const fromDate = new Date(filters.createdDateFrom);
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          new Date(pi.created * 1000) >= fromDate
        );
      }

      if (filters.createdDateTo) {
        const toDate = new Date(filters.createdDateTo);
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          new Date(pi.created * 1000) <= toDate
        );
      }

      if (filters.capturedDateFrom) {
        const fromDate = new Date(filters.capturedDateFrom);
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.charges?.data?.some(charge => 
            charge.captured && new Date(charge.created * 1000) >= fromDate
          )
        );
      }

      if (filters.capturedDateTo) {
        const toDate = new Date(filters.capturedDateTo);
        filteredPaymentIntents = filteredPaymentIntents.filter(pi => 
          pi.charges?.data?.some(charge => 
            charge.captured && new Date(charge.created * 1000) <= toDate
          )
        );
      }

      return {
        ...paymentIntents,
        data: filteredPaymentIntents,
        has_more: false, // Since we're filtering client-side
      };
    } catch (error) {
      this.logger.error('Error listing payment intents with filters:', error.message);
      throw new BadRequestException(`Failed to list payment intents: ${error.message}`);
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<Stripe.PaymentIntent> {
    await this.ensureStripeInitialized();

    try {
      const confirmData: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmData.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe!.paymentIntents.confirm(paymentIntentId, confirmData);
      this.logger.log(`Confirmed payment intent ${paymentIntentId}`);

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error confirming payment intent ${paymentIntentId}:`, error.message);
      throw new BadRequestException(`Failed to confirm payment intent: ${error.message}`);
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    await this.ensureStripeInitialized();

    try {
      const paymentIntent = await this.stripe!.paymentIntents.cancel(paymentIntentId);
      this.logger.log(`Canceled payment intent ${paymentIntentId}`);

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error canceling payment intent ${paymentIntentId}:`, error.message);
      throw new BadRequestException(`Failed to cancel payment intent: ${error.message}`);
    }
  }

  async capturePaymentIntent(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.PaymentIntent> {
    await this.ensureStripeInitialized();

    try {
      const captureData: Stripe.PaymentIntentCaptureParams = {};

      if (amount) {
        captureData.amount_to_capture = Math.round(amount * 100);
      }

      const paymentIntent = await this.stripe!.paymentIntents.capture(paymentIntentId, captureData);
      this.logger.log(`Captured payment intent ${paymentIntentId}`);

      return paymentIntent;
    } catch (error) {
      this.logger.error(`Error capturing payment intent ${paymentIntentId}:`, error.message);
      throw new BadRequestException(`Failed to capture payment intent: ${error.message}`);
    }
  }

  async getCharge(chargeId: string): Promise<Stripe.Charge> {
    await this.ensureStripeInitialized();

    try {
      const charge = await this.stripe!.charges.retrieve(chargeId, {
        expand: ['payment_intent', 'customer'],
      });

      return charge;
    } catch (error) {
      this.logger.error(`Error retrieving charge ${chargeId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve charge: ${error.message}`);
    }
  }

  async listCharges(
    customerId?: string,
    paymentIntentId?: string,
    limit: number = 100,
  ): Promise<Stripe.ApiList<Stripe.Charge>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.ChargeListParams = {
        limit,
        expand: ['data.payment_intent', 'data.customer'],
      };

      if (customerId) {
        params.customer = customerId;
      }

      if (paymentIntentId) {
        params.payment_intent = paymentIntentId;
      }

      const charges = await this.stripe!.charges.list(params);
      return charges;
    } catch (error) {
      this.logger.error('Error listing charges:', error.message);
      throw new BadRequestException(`Failed to list charges: ${error.message}`);
    }
  }

  async createRefund(
    chargeId: string,
    amount?: number,
    reason?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Refund> {
    await this.ensureStripeInitialized();

    try {
      const refundData: Stripe.RefundCreateParams = {
        charge: chargeId,
        metadata,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      if (reason) {
        refundData.reason = reason as 'duplicate' | 'fraudulent' | 'requested_by_customer';
      }

      const refund = await this.stripe!.refunds.create(refundData);
      this.logger.log(`Created refund ${refund.id} for charge ${chargeId}`);

      return refund;
    } catch (error) {
      this.logger.error(`Error creating refund for charge ${chargeId}:`, error.message);
      throw new BadRequestException(`Failed to create refund: ${error.message}`);
    }
  }

  async getRefund(refundId: string): Promise<Stripe.Refund> {
    await this.ensureStripeInitialized();

    try {
      const refund = await this.stripe!.refunds.retrieve(refundId);
      return refund;
    } catch (error) {
      this.logger.error(`Error retrieving refund ${refundId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve refund: ${error.message}`);
    }
  }

  async listRefunds(
    chargeId?: string,
    paymentIntentId?: string,
    limit: number = 100,
  ): Promise<Stripe.ApiList<Stripe.Refund>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.RefundListParams = {
        limit,
      };

      if (chargeId) {
        params.charge = chargeId;
      }

      if (paymentIntentId) {
        params.payment_intent = paymentIntentId;
      }

      const refunds = await this.stripe!.refunds.list(params);
      return refunds;
    } catch (error) {
      this.logger.error('Error listing refunds:', error.message);
      throw new BadRequestException(`Failed to list refunds: ${error.message}`);
    }
  }

  async createTransfer(
    amount: number,
    currency: string,
    destination: string,
    description?: string,
    metadata?: Record<string, string>,
  ): Promise<Stripe.Transfer> {
    await this.ensureStripeInitialized();

    try {
      const transferData: Stripe.TransferCreateParams = {
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        destination,
        description,
        metadata,
      };

      const transfer = await this.stripe!.transfers.create(transferData);
      this.logger.log(`Created transfer ${transfer.id} to ${destination}`);

      return transfer;
    } catch (error) {
      this.logger.error(`Error creating transfer to ${destination}:`, error.message);
      throw new BadRequestException(`Failed to create transfer: ${error.message}`);
    }
  }

  async getTransfer(transferId: string): Promise<Stripe.Transfer> {
    await this.ensureStripeInitialized();

    try {
      const transfer = await this.stripe!.transfers.retrieve(transferId);
      return transfer;
    } catch (error) {
      this.logger.error(`Error retrieving transfer ${transferId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve transfer: ${error.message}`);
    }
  }

  async listTransfers(limit: number = 100): Promise<Stripe.ApiList<Stripe.Transfer>> {
    await this.ensureStripeInitialized();

    try {
      const transfers = await this.stripe!.transfers.list({ limit });
      return transfers;
    } catch (error) {
      this.logger.error('Error listing transfers:', error.message);
      throw new BadRequestException(`Failed to list transfers: ${error.message}`);
    }
  }

  async getBalance(): Promise<Stripe.Balance> {
    await this.ensureStripeInitialized();

    try {
      const balance = await this.stripe!.balance.retrieve();
      return balance;
    } catch (error) {
      this.logger.error('Error retrieving balance:', error.message);
      throw new BadRequestException(`Failed to retrieve balance: ${error.message}`);
    }
  }

  async getBalanceTransactions(limit: number = 100): Promise<Stripe.ApiList<Stripe.BalanceTransaction>> {
    await this.ensureStripeInitialized();

    try {
      const balanceTransactions = await this.stripe!.balanceTransactions.list({ limit });
      return balanceTransactions;
    } catch (error) {
      this.logger.error('Error listing balance transactions:', error.message);
      throw new BadRequestException(`Failed to list balance transactions: ${error.message}`);
    }
  }
} 