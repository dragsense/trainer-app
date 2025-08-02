// External Libraries
import { z } from  'zod';

// Types
import { IPaymentMethod, TUpdatePaymentMethodData } from "@/@types/setting.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { ListHandler } from "@/handlers";

// Custom UI Components
import { PaymentMethodsCards } from '@/components/admin/settings';

// API
import { fetchPaymentMethodsList, updatePaymentMethod, fetchPaymentMethod } from "@/services/setting.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Schema
export const PaymentMethodSchema = z.object({
  isEnabled: z.boolean().optional(),
  config: z.record(z.any()).optional(),
});

export default function PaymentMethodsPage() {
  const PAYMENT_METHOD_INITIAL_VALUES: TDefaultValue<Partial<TUpdatePaymentMethodData>> = {
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
        queryFn={fetchPaymentMethod}
        storeKey="paymentMethods"
        mutationFns={{
          updateFn: updatePaymentMethod
        }}
        ListComponent={PaymentMethodsCards}
        FormComponent={() => null}
        validationSchema={PaymentMethodSchema}
        initialValues={PAYMENT_METHOD_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />
    </div>
  );
}
