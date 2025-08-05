import { useQueryClient } from "@tanstack/react-query";


// Handlers
import { ListHandler, SingleHandler } from "@/handlers";

// Custom UI Components
import { BillingTable, BillingView, BillingViewModal } from "@/components/admin";
import { BillingForm } from "@/page-components";


// API
import { deleteBilling, fetchBilling, fetchBillings } from "@/services/billing.api";

// Types
import { IBilling } from "@/@types/billing.type";


// Layouts
import { PageInnerLayout } from "@/layouts";



export default function BillingsPage() {

  const queryBilling = useQueryClient();

  const STORE_KEY = 'billing';

  return (
    <PageInnerLayout Header={<Header />}>
      <SingleHandler<IBilling>
        queryFn={fetchBilling}
        deleteFn={deleteBilling}
        storeKey={STORE_KEY}
        onDeleteSuccess={() => queryBilling.invalidateQueries({ queryKey: [STORE_KEY + "-list"] })}
        SingleComponent={BillingViewModal}
        actionComponents={[
          {
            action: 'createOrUpdate',
            comp: BillingForm
          },
        ]}
      />

      <ListHandler<IBilling>
        queryFn={fetchBillings}
        ListComponent={BillingTable}
        storeKey={STORE_KEY}
      />
    </PageInnerLayout>
  );
}



const Header = () => null
