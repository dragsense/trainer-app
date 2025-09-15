import { useQueryClient } from "@tanstack/react-query";


// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { BillingList, BillingViewModal, InvoiceViewModal } from "@/components/admin";
import { BillingForm, BillingStatusDialog } from "@/page-components";


// API
import { deleteBilling, fetchBilling, fetchBillings } from "@/services/billing.api";

// Types
import { IBilling } from "@/@types/billing.type";


// Layouts
import { PageInnerLayout } from "@/layouts";



export default function BillingsPage() {

  const queryBilling = useQueryClient();

  const STORE_KEY = 'billing';

  return (<>
      <SingleHandler<IBilling>
        queryFn={fetchBilling}
        deleteFn={deleteBilling}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryBilling.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={({ storeKey, store }) => <BillingViewModal storeKey={storeKey} store={store} />}
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

      <ListHandler<IBilling>
        queryFn={fetchBillings}
        ListComponent={BillingList}
        storeKey={STORE_KEY}
      />
    </>
  );
}



const Header = () => null
