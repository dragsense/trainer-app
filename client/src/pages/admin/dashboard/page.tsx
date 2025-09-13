// External Libraries
// Types
import { ICombinedDashboardData } from "@/@types/dashboard.type"
import { AnalyticsPeriod } from "#/modules/v1/dashboard/enums/dashboard-analytics.enum";

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { DashboardControls, DashboardView, IExtraProps } from "@/components/admin"

// Layouts
import { PageInnerLayout } from "@/layouts"

// API
import { fetchCombinedDashboardData } from "@/services/dashboard.api";

// Stores
import { TSingleHandlerStore } from "@/stores";



export default function DashboardPage() {

  return (

    <SingleHandler<ICombinedDashboardData, IExtraProps>
      queryFn={(_, params) => fetchCombinedDashboardData(params)}
      storeKey="dashboardOverview"
      SingleComponent={({ storeKey, store }) => {


        if (!store) {
          return <div>Dashboard store "{storeKey}" not found. Did you forget to register it?</div>;
        }

        return <PageInnerLayout
          Header={
            <Header
              store={store}
            />
          }
        >
          <DashboardView storeKey={storeKey} store={store} />
        </PageInnerLayout>

      }}
      enabled={true}
      singleProps={{
        period: AnalyticsPeriod.MONTH,
      }}
      initialParams={{
        period: AnalyticsPeriod.MONTH,
        customRange: undefined
      }}
    />


  )
}


interface HeaderProps {
  store: TSingleHandlerStore<ICombinedDashboardData, IExtraProps>
}

const Header = ({
  store
}: HeaderProps) => (
  <DashboardControls store={store} />
)
