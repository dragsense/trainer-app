// External Libraries
import { z } from "zod";

// Types
import { IStripeConnectStatus, TCreateStripeConnectData, IStripeConnectCreateResponse } from "@/@types/setting.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { StripeConnectForm, StripeConnectInfoCard } from "@/components/admin";

// API
import { getStripeConnectStatus, createStripeConnect, deleteStripeConnect } from "@/services/setting.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Schema
export const StripeConnectSchema = z.object({
  country: z.string().optional(),
  type: z.enum(['express', 'standard']).optional(),
});

export default function StripeConnectPage() {
  const STRIPE_CONNECT_INITIAL_VALUES: TDefaultValue<Partial<TCreateStripeConnectData>> = {
    country: { value: 'US' },
    type: { value: 'express' },
  };

  return (
    <div className="space-y-6">
      <SingleHandler<IStripeConnectStatus, TCreateStripeConnectData, IStripeConnectCreateResponse>
        queryFn={getStripeConnectStatus}
        storeKey="stripeConnect"
        mutationFns={{
          createFn: createStripeConnect,
          deleteFn: async () => { await deleteStripeConnect(); }
        }}
        id={1}
        FormComponent={StripeConnectForm}
        validationSchema={StripeConnectSchema}
        initialValues={STRIPE_CONNECT_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
      />

      {/* Information Section */}
      <StripeConnectInfoCard />
    </div>
  );
}
