// External Libraries
// Types
import { ICombinedDashboardData } from "@shared/interfaces/dashboard.interface"
import { EAnalyticsPeriod } from "@shared/enums/dashboard-analytics.enum";

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

    <SingleHandler<ICombinedDashboardData, any, any, any, any, IExtraProps>
      get={(_i, queryParams) => fetchCombinedDashboardData(queryParams || {})}
      initialValues={{
        create: {},
        update: {}
      }}
 
      storeKey="dashboardOverview"
      Components={{ 
        Single: ({ storeKey, store }) => {


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


        }
      }}
      enabled={true}
      extraProps={{
        single: {
          period: EAnalyticsPeriod.MONTH,
          customRange: undefined
        }
      }}
      initialParams={{
        single: {
          period: EAnalyticsPeriod.MONTH,
          customRange: undefined
        }
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
