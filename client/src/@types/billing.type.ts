import { Billing } from "#/modules/v1/billings/entities/billing.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateBillingDto } from "#/modules/v1/billings/dto/create-billing.dto";
import { UpdateBillingStatusDto } from "#/modules/v1/billings/dto/update-billing.dto";


export interface IBilling extends Billing, GeneralBaseEntity {}


export type TBillingData = CreateBillingDto;
export type TUpdateBillingStatusData = UpdateBillingStatusDto;


export interface IStripeTransaction {
  id: string;
  paymentIntentId: string;
  customerName: string;
  customerEmail: string;
  status: 'succeeded' | 'failed' | 'pending' | 'canceled';
  type: 'payment' | 'refund';
  amount: number;
  currency: string;
  description: string;
  created: string;
  receiptUrl?: string;
  refunded: boolean;
}



export interface IStripeInvoiceLineItem {
  id: string;
  object: string;
  amount: number;
  currency: string;
  description: string;
  quantity: number;
  metadata?: Record<string, string>;
}

export interface IStripeInvoiceLines {
  object: string;
  data: IStripeInvoiceLineItem[];
  has_more: boolean;
  total_count: number;
  url: string;
}


export interface IStripeInvoice {
  id: string;
  object: string;
  account_country: string;
  account_name: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  customer: string;
  customer_email: string;
  customer_name: string;
  description?: string;
  due_date?: string | number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  lines: IStripeInvoiceLines;
  metadata?: Record<string, string>;
  number: string;
  status: 'paid' | 'open' | 'void' | 'draft' | 'uncollectible';
  subtotal: number;
  total: number;
  total_discount_amounts: any[];
  total_taxes: any[];
  created: number;
  effective_at: number;
  period_end: number;
  period_start: number;
}