// React & Hooks

// Types
import { IStripeTransaction } from "@/@types/billing.type";
import { IPaginatedResponse } from "@/@types/api/response.type";
import { IListQueryParams } from "@/@types/api/param.type";

// Handlers
import { ListHandler } from "@/handlers";

// Layout Components

// Custom UI Components
import { StripeTransactionTable } from "@/components/admin";

// Services
import { fetchStripeCharges } from "@/services/billing.api";

// Transform Stripe response to our expected format
const transformStripeCharges = (stripeData: any): IStripeTransaction[] => {
  if (!stripeData?.data) return [];
  
  return stripeData.data.map((charge: any) => ({
    id: charge.id,
    paymentIntentId: charge.payment_intent?.id,
    customerName: charge.billing_details?.name || 'Unknown Customer',
    customerEmail: charge.billing_details?.email || 'No Email',
    status: charge.status,
    type: 'payment' as const,
    amount: charge.amount,
    currency: charge.currency,
    description: charge.description || 'No description',
    created: new Date(charge.created * 1000).toISOString(),
    receiptUrl: charge.receipt_url,
    refunded: charge.refunded,
  }));
};

const transformStripeRefunds = (stripeData: any): IStripeTransaction[] => {
  if (!stripeData?.data) return [];
  
  return stripeData.data.map((refund: any) => ({
    id: refund.id,
    paymentIntentId: refund.payment_intent,
    customerId: refund.customer,
    customerName: refund.billing_details?.name || 'Unknown Customer',
    customerEmail: refund.billing_details?.email || 'No Email',
    status: refund.status,
    type: 'refund' as const,
    amount: refund.amount,
    currency: refund.currency,
    description: refund.reason || 'Refund',
    created: new Date(refund.created * 1000).toISOString(),
    receiptUrl: refund.receipt_url,
    refunded: false,
  }));
};

export default function BillingTransactionsPage() {
  return (
    <ListHandler<IStripeTransaction>
      ListComponent={StripeTransactionTable}
      storeKey={"stripeTransactions"}
      queryFn={async (params: IListQueryParams): Promise<IPaginatedResponse<IStripeTransaction>> => {
        const [chargesResponse] = await Promise.all([
          fetchStripeCharges({ 
            limit: params.limit || 10
          }),
          
        ]);
        const charges = transformStripeCharges(chargesResponse);
        const combinedData = [...charges];

        return {
          data: combinedData,
          total: combinedData.length,
          page: params.page || 1,
          limit: params.limit || 10,
          lastPage: Math.ceil(combinedData.length / (params.limit || 10)),
          hasNextPage: false,
          hasPrevPage: false,
        };
      }}
    />
  );
} 