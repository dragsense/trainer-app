
// External Libraries
import { z } from "zod";

// Types
import { IBilling, TBillingData } from "@/@types/billing.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { BillingCurrency, BillingStatus, BillingType } from "#/modules/v1/billings/enums/billing.enum";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { BillingFormModal, BillingTable } from "@/components/admin";


// API
import { createBilling, deleteBilling, fetchBilling, fetchBillings, updateBilling } from "@/services/billing.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Layouts
import { PageInnerLayout } from "@/layouts";



export const LineItemSchema = z.object({
  description: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
  tax: z.number().optional(),
});

export const BillingSchema = z.object({
  stripeInvoiceId: z.string().optional(),
  type: z.nativeEnum(BillingType),
  status: z.nativeEnum(BillingStatus).optional(),
  invoiceAmount: z.number().optional(),
  currency: z.nativeEnum(BillingCurrency).optional(),
  userId: z.number().min(1, "User is required"),
  sessionId: z.number().optional(),
  issueDate: z.date().optional(),
  dueDate: z.date().optional(),
  lineItems: z.array(LineItemSchema).optional(),
  totalTax: z.number().optional(),
  discount: z.number().optional(),
  totalAmount: z.number().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});



export default function BillingsPage() {


  const INITIAL_VALUES: TDefaultValue<TBillingData> = {
    stripeInvoiceId: { value: "" },
    type: { value: BillingType.INDIVIDUAL },
    status: { value: BillingStatus.PENDING },
    invoiceAmount: { value: 0 },
    currency: { value: BillingCurrency.USD },
    userId: { value: 0 },
    sessionId: { value: undefined },
    issueDate: { value: new Date() },
    dueDate: { value: new Date() },
    lineItems: { value: [] },
    totalTax: { value: 0 },
    discount: { value: 0 },
    totalAmount: { value: 0 },
    notes: { value: "" },
    terms: { value: "" },
  };



  return (
    <PageInnerLayout Header={<Header />}>
      <ListHandler<IBilling, Partial<TBillingData>, IBilling | IMessageResponse>
        queryListFn={fetchBillings}
        ListComponent={BillingTable}
        storeKey="billingsList"
        mutationFns={{
          createFn: createBilling,
          updateFn: updateBilling,
          deleteFn: deleteBilling
        }}
        queryFn={fetchBilling}
        FormComponent={BillingFormModal}
        validationSchema={BillingSchema}
        initialValues={INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />

    </PageInnerLayout>
  );
}



const Header = () => null
