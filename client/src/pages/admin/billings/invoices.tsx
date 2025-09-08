// React & Hooks

// Types
import { IStripeInvoice } from "@/@types/billing.type";

// Handlers
import { ListHandler } from "@/handlers";

// Layout Components

// Custom UI Components
import { StripeInvoiceTable } from "@/components/admin";

// Services
import { fetchStripeInvoices } from "@/services/billing.api";

// Transform Stripe response to our expected format
const transformStripeInvoices = (stripeData: any): IStripeInvoice[] => {
  if (!stripeData?.data) return [];

  return stripeData.data.map((invoice: any) => ({
    ...invoice,
    paidDate: invoice.status === 'paid' ? new Date(invoice.status_transitions?.paid_at * 1000).toISOString() : undefined,
    description: invoice.description || invoice.lines?.data?.map((line: any) => line.description).join(', ') || 'No description',
  }));
};

export default function BillingInvoicesPage() {
  return (
    <ListHandler<IStripeInvoice>
      ListComponent={StripeInvoiceTable}
      storeKey={"stripeInvoices"}
      queryFn={async (params) => {
        const response = await fetchStripeInvoices({
          limit: params.limit || 10
        });

        // Transform the response to match our expected format
        const transformedData = transformStripeInvoices(response);

        return {
          data: transformedData,
          total: transformedData.length,
          page: params.page || 1,
          limit: params.limit || 10,
          lastPage: Math.ceil(transformedData.length / (params.limit || 10)),
          hasNextPage: false,
          hasPrevPage: false,
        };
      }}
    />


  );
} 