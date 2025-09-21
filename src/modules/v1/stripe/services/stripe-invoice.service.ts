/* eslint-disable prettier/prettier */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PaymentMethodsService } from '@/modules/v1/settings/payment-methods/payment-methods.service';
import Stripe from 'stripe';

@Injectable()
export class StripeInvoiceService {
  private readonly logger = new Logger(StripeInvoiceService.name);
  private stripe: Stripe | null = null;

  constructor(private readonly paymentMethodsService: PaymentMethodsService) {
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.logger.log('Initializing Stripe invoice service...');
      const stripeConfig = await this.paymentMethodsService.getStripeConfig();

      if (stripeConfig?.secretKey) {
        this.stripe = new Stripe(stripeConfig.secretKey);
        this.logger.log('Stripe invoice service initialized successfully');
      } else {
        this.logger.warn('Stripe not configured in payment methods settings');
        this.stripe = null;
      }
    } catch (error) {
      this.logger.error('Error initializing Stripe invoice service:', error.message);
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

  async createInvoice(
    customerId: string,
    items: Array<{
      priceId?: string;
      amount?: number;
      currency?: string;
      quantity?: number;
      description?: string;
    }>,
    metadata?: Record<string, string>,
    dueDate?: number,
    auto_payment?: boolean,
    payData: Stripe.InvoicePayParams = {},

  ): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      this.logger.log(`Creating invoice for customer ${customerId} with dueDate: ${dueDate} (${dueDate ? new Date(dueDate * 1000).toISOString() : 'not set'})`);

      const invoiceData: Stripe.InvoiceCreateParams = {
        customer: customerId,
        metadata,
        expand: ['payment_intent'],
        auto_advance: true
      };


      invoiceData.collection_method = 'send_invoice';
      invoiceData.due_date = dueDate;
      invoiceData.payment_settings = {
        payment_method_types: ['card'],
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
      };
      this.logger.log(`Using charge_automatically collection method`);

      const invoice = await this.stripe!.invoices.create(invoiceData);
      this.logger.log(`Created invoice ${invoice.id} for customer ${customerId} with collection method: ${invoiceData.collection_method}`);

      for (const item of items) {
        await this.createInvoiceItemWithAmount(customerId, item.amount || 0, item.currency || 'usd', item.description, metadata, invoice.id);
      }

      // Finalize the invoice to calculate the total
      await this.stripe!.invoices.finalizeInvoice(invoice.id as string, payData);
      this.logger.log(`Finalized invoice ${invoice.id} with items`);

      // Retrieve the invoice with payment intent
      const invoiceWithPaymentIntent = await this.stripe!.invoices.retrieve(invoice.id as string, {
        expand: ['payment_intent'],
      });

      this.logger.log(`Invoice ${invoice.id} created successfully`);
      return invoiceWithPaymentIntent;
    } catch (error) {
      this.logger.error(`Error creating invoice for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to create invoice: ${error.message}`);
    }
  }

  async getInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      const invoice = await this.stripe!.invoices.retrieve(invoiceId, {
        expand: ['payment_intent', 'subscription'],
      });

      return invoice;
    } catch (error) {
      this.logger.error(`Error retrieving invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve invoice: ${error.message}`);
    }
  }

  async updateInvoice(
    invoiceId: string,
    updates: {
      metadata?: Record<string, string>;
      dueDate?: number;
      description?: string;
    },
  ): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      const updateData: Stripe.InvoiceUpdateParams = {};

      if (updates.metadata) {
        updateData.metadata = updates.metadata;
      }

      if (updates.dueDate) {
        updateData.due_date = updates.dueDate;
      }

      if (updates.description) {
        updateData.description = updates.description;
      }

      const invoice = await this.stripe!.invoices.update(invoiceId, updateData);
      this.logger.log(`Updated invoice ${invoiceId}`);

      return invoice;
    } catch (error) {
      this.logger.error(`Error updating invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to update invoice: ${error.message}`);
    }
  }

  async finalizeInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      const invoice = await this.stripe!.invoices.finalizeInvoice(invoiceId);
      this.logger.log(`Finalized invoice ${invoiceId}`);

      return invoice;
    } catch (error) {
      this.logger.error(`Error finalizing invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to finalize invoice: ${error.message}`);
    }
  }

  async payInvoice(
    invoiceId: string,
    payData: Stripe.InvoicePayParams = {},
    paymentMethodId?: string
  ): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      // Merge payment method into the provided payData
      if (paymentMethodId) {
        payData.payment_method = paymentMethodId;
      }

      const invoice = await this.stripe!.invoices.pay(invoiceId, payData);
      this.logger.log(`Paid invoice ${invoiceId} successfully`);

      return invoice;
    } catch (error) {
      this.logger.error(`Error paying invoice ${invoiceId}: ${error.message}`);
      throw new BadRequestException(`Failed to pay invoice: ${error.message}`);
    }
  }

  async voidInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      const invoice = await this.stripe!.invoices.voidInvoice(invoiceId);
      this.logger.log(`Voided invoice ${invoiceId}`);

      return invoice;
    } catch (error) {
      this.logger.error(`Error voiding invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to void invoice: ${error.message}`);
    }
  }

  async sendInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    await this.ensureStripeInitialized();

    try {
      const invoice = await this.stripe!.invoices.sendInvoice(invoiceId);
      this.logger.log(`Sent invoice ${invoiceId}`);

      return invoice;
    } catch (error) {
      this.logger.error(`Error sending invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to send invoice: ${error.message}`);
    }
  }

  async listInvoices(
    customerId?: string,
    status?: string,
    limit: number = 100,
  ): Promise<Stripe.ApiList<Stripe.Invoice>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.InvoiceListParams = {
        limit,
        expand: ['data.payment_intent', 'data.subscription'],
      };

      if (customerId) {
        params.customer = customerId;
      }

      if (status) {
        params.status = status as Stripe.Invoice.Status;
      }

      const invoices = await this.stripe!.invoices.list(params);
      return invoices;
    } catch (error) {
      this.logger.error('Error listing invoices:', error.message);
      throw new BadRequestException(`Failed to list invoices: ${error.message}`);
    }
  }

  async listInvoicesWithFilters(filters: {
    search?: string;
    status?: string;
    customerId?: string;
    currency?: string;
    minAmount?: number;
    maxAmount?: number;
    invoiceNumber?: string;
    createdDateFrom?: string;
    createdDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
    paidDateFrom?: string;
    paidDateTo?: string;
    limit?: number;
  }): Promise<Stripe.ApiList<Stripe.Invoice>> {
    await this.ensureStripeInitialized();

    try {
      const params: Stripe.InvoiceListParams = {
        limit: filters.limit || 100,
        expand: ['data.payment_intent', 'data.subscription'],
      };

      // Apply filters
      if (filters.customerId) {
        params.customer = filters.customerId;
      }

      if (filters.status) {
        params.status = filters.status as Stripe.Invoice.Status;
      }

      // Get all invoices first (Stripe doesn't support complex filtering)
      const invoices = await this.stripe!.invoices.list(params);
      
      // Apply client-side filtering for fields not supported by Stripe API
      let filteredInvoices = invoices.data;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.id?.toLowerCase().includes(searchTerm) ||
          (invoice.number && invoice.number.toLowerCase().includes(searchTerm)) ||
          (invoice.description && invoice.description.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.currency) {
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.currency === filters.currency
        );
      }

      if (filters.minAmount !== undefined) {
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.amount_due >= filters.minAmount!
        );
      }

      if (filters.maxAmount !== undefined) {
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.amount_due <= filters.maxAmount!
        );
      }

      if (filters.invoiceNumber) {
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.number && invoice.number.includes(filters.invoiceNumber!)
        );
      }

      if (filters.createdDateFrom) {
        const fromDate = new Date(filters.createdDateFrom);
        filteredInvoices = filteredInvoices.filter(invoice => 
          new Date(invoice.created * 1000) >= fromDate
        );
      }

      if (filters.createdDateTo) {
        const toDate = new Date(filters.createdDateTo);
        filteredInvoices = filteredInvoices.filter(invoice => 
          new Date(invoice.created * 1000) <= toDate
        );
      }

      if (filters.dueDateFrom) {
        const fromDate = new Date(filters.dueDateFrom);
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.due_date && new Date(invoice.due_date * 1000) >= fromDate
        );
      }

      if (filters.dueDateTo) {
        const toDate = new Date(filters.dueDateTo);
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.due_date && new Date(invoice.due_date * 1000) <= toDate
        );
      }

      if (filters.paidDateFrom) {
        const fromDate = new Date(filters.paidDateFrom);
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.status_transitions?.paid_at && new Date(invoice.status_transitions.paid_at * 1000) >= fromDate
        );
      }

      if (filters.paidDateTo) {
        const toDate = new Date(filters.paidDateTo);
        filteredInvoices = filteredInvoices.filter(invoice => 
          invoice.status_transitions?.paid_at && new Date(invoice.status_transitions.paid_at * 1000) <= toDate
        );
      }

      return {
        ...invoices,
        data: filteredInvoices,
        has_more: false, // Since we're filtering client-side
      };
    } catch (error) {
      this.logger.error('Error listing invoices with filters:', error.message);
      throw new BadRequestException(`Failed to list invoices: ${error.message}`);
    }
  }

  async getInvoicePDF(invoiceId: string): Promise<string> {
    await this.ensureStripeInitialized();

    try {
      const invoice = await this.stripe!.invoices.retrieve(invoiceId);
      const pdfUrl = invoice.hosted_invoice_url;
      this.logger.log(`Retrieved PDF URL for invoice ${invoiceId}`);

      return pdfUrl || '';
    } catch (error) {
      this.logger.error(`Error retrieving PDF for invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to retrieve invoice PDF: ${error.message}`);
    }
  }

  async createInvoiceItem(
    customerId: string,
    priceId: string,
    quantity?: number,
    description?: string,
    metadata?: Record<string, string>,
    invoiceId?: string, // Added invoiceId parameter
  ): Promise<Stripe.InvoiceItem> {
    await this.ensureStripeInitialized();

    try {
      // Get the price to get the amount and currency
      const price = await this.stripe!.prices.retrieve(priceId);

      const invoiceItemData: any = {
        customer: customerId,
        amount: (price.unit_amount || 0) * (quantity || 1), // Calculate total amount including quantity
        currency: price.currency,
        metadata,
      };

      if (description) {
        invoiceItemData.description = description;
      }

      if (invoiceId) {
        invoiceItemData.invoice = invoiceId; // Link invoice item to the invoice
      }

      const invoiceItem = await this.stripe!.invoiceItems.create(invoiceItemData);
      this.logger.log(`Created invoice item for customer ${customerId}`);

      return invoiceItem;
    } catch (error) {
      this.logger.error(`Error creating invoice item for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to create invoice item: ${error.message}`);
    }
  }

  async createInvoiceItemWithAmount(
    customerId: string,
    amount: number,
    currency: string,
    description?: string,
    metadata?: Record<string, string>,
    invoiceId?: string,
  ): Promise<Stripe.InvoiceItem> {
    await this.ensureStripeInitialized();

    try {
      const invoiceItemData: any = {
        customer: customerId,
        amount: Math.round(amount), 
        currency: currency.toLowerCase(),
        metadata,
      };

      if (description) {
        invoiceItemData.description = description;
      }

      if (invoiceId) {
        invoiceItemData.invoice = invoiceId; // Link invoice item to the invoice
      }

      const invoiceItem = await this.stripe!.invoiceItems.create(invoiceItemData);
      this.logger.log(`Created invoice item with amount ${amount} ${currency} for customer ${customerId}`);

      return invoiceItem;
    } catch (error) {
      this.logger.error(`Error creating invoice item with amount for customer ${customerId}:`, error.message);
      throw new BadRequestException(`Failed to create invoice item: ${error.message}`);
    }
  }

  async deleteInvoiceItem(invoiceItemId: string): Promise<Stripe.DeletedInvoiceItem> {
    await this.ensureStripeInitialized();

    try {
      const deletedItem = await this.stripe!.invoiceItems.del(invoiceItemId);
      this.logger.log(`Deleted invoice item ${invoiceItemId}`);

      return deletedItem;
    } catch (error) {
      this.logger.error(`Error deleting invoice item ${invoiceItemId}:`, error.message);
      throw new BadRequestException(`Failed to delete invoice item: ${error.message}`);
    }
  }

  async getCheckoutSession(
    invoiceId: string,
    customer: Stripe.Customer,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>,
  ): Promise<{ url: string }> {
    await this.ensureStripeInitialized();

    try {
      // First, finalize the invoice if it's not already finalized
      const invoice = await this.stripe!.invoices.retrieve(invoiceId);

      if (invoice.status === 'draft') {
        await this.stripe!.invoices.finalizeInvoice(invoiceId);
        this.logger.log(`Finalized invoice ${invoiceId} for checkout`);
      }

      // Check if invoice already has a payment intent
      if ((invoice as any).payment_intent) {
        this.logger.log(`Invoice ${invoiceId} already has payment intent, using hosted URL`);
        const hostedInvoiceUrl = invoice.hosted_invoice_url;

        if (hostedInvoiceUrl) {
          return { url: hostedInvoiceUrl };
        }
      }


      // Create checkout session for the payment intent
      const session = await this.stripe!.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: invoice.currency,
              product_data: {
                name: `Invoice ${invoice.number || invoiceId}`,
                description: invoice.description || 'Membership Invoice',
              },
              unit_amount: invoice.amount_due,
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          setup_future_usage: 'off_session',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          invoiceId: invoiceId,
          ...(metadata ? metadata : {}),
        },
      });

      this.logger.log(`Created checkout session for invoice ${invoiceId}`);
      return { url: session.url! };
    } catch (error) {
      this.logger.error(`Error creating checkout session for invoice ${invoiceId}:`, error.message);
      throw new BadRequestException(`Failed to create checkout session: ${error.message}`);
    }
  }
} 