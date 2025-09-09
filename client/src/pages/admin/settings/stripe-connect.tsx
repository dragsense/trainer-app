// External Libraries

// Types
import { IStripeConnectStatus } from "@/@types/setting.type";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { StripeConnectInfoCard } from "@/components/admin";
import { StripeConnectForm } from "@/page-components";

// API
import { getStripeConnectStatus, deleteStripeConnect } from "@/services/setting.api";


export default function StripeConnectPage() {

  return (
      <SingleHandler<IStripeConnectStatus>
        queryFn={getStripeConnectStatus}
        deleteFn={deleteStripeConnect}
        storeKey="stripeConnect"
        SingleComponent={StripeConnectInfoCard}
        enabled={true}
        actionComponents={[{
          action: "connectStripe",
          comp: StripeConnectForm
        }]}
      />
  );
}
