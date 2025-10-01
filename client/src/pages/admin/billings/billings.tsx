import { useQueryClient } from "@tanstack/react-query";


// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { BillingList, BillingViewModal, InvoiceViewModal } from "@/components/admin";
import { BillingForm, BillingStatusDialog } from "@/page-components";


// API
import { deleteBilling, fetchBilling, fetchBillings } from "@/services/billing.api";

// Types
import { IBilling } from "@shared/interfaces/billing.interface";


// Layouts
import { PageInnerLayout } from "@/layouts";
import { useAuthUser } from "@/hooks/use-auth-user";



export default function BillingsPage() {

  const { user } = useAuthUser();

  const queryBilling = useQueryClient();

  const STORE_KEY = 'billing';

  return (<>
      <SingleHandler<IBilling, any>
        queryFn={fetchBilling}
        deleteFn={deleteBilling}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryBilling.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={({ storeKey, store }) => <BillingViewModal storeKey={storeKey} store={store} />}
        singleProps={{
          level: user?.level
        }}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: BillingForm
          },
          {
            action: 'status',
            comp: BillingStatusDialog
          },
          {
            action: 'viewInvoice',
            comp: InvoiceViewModal
          },
        ]}
      />

      <ListHandler<IBilling, any>
        queryFn={fetchBillings}
        ListComponent={BillingList}
        storeKey={STORE_KEY}
        listProps={{
          level: user?.level
        }}
      />
    </>
  );
}



const Header = () => null
