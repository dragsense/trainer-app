// External Libraries
import { z } from  'zod';

// Types
import { IPaymentMethod, TUpdatePaymentMethodData } from "@/@types/setting.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { PaymentMethodCardForm } from "@/components/admin/settings";

// API
import { fetchPaymentMethodsList, updatePaymentMethod } from "@/services/setting.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Schema
export const PaymentMethodSchema = z.object({
  isEnabled: z.boolean().optional(),
  config: z.record(z.any()).optional(),
});

export default function PaymentMethodsPage() {
  const PAYMENT_METHOD_INITIAL_VALUES: TDefaultValue<Partial<IPaymentMethod>> = {
    isEnabled: { value: false },
    config: { value: {} },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
        <p className="text-gray-600 mt-1">
          Configure and enable payment methods for your business
        </p>
      </div>
      
      <ListHandler<IPaymentMethod, TUpdatePaymentMethodData, IMessageResponse>
        name="Payment Method"
        queryListFn={fetchPaymentMethodsList}
        storeKey="paymentMethods"
        mutationFns={{
          updateFn: updatePaymentMethod
        }}
        ListComponent={PaymentMethodsList}
        FormComponent={PaymentMethodCardForm}
        validationSchema={PaymentMethodSchema}
        initialValues={PAYMENT_METHOD_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />
    </div>
  );
}

// Simple list component to display payment methods
function PaymentMethodsList({ storeKey }: { storeKey: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Available Payment Methods</h3>
      <p className="text-gray-500">Payment methods list will be displayed here. Store key: {storeKey}</p>
    </div>
  );
}
