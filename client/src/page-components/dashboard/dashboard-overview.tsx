import React from 'react';

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { DashboardView } from '@/components/admin';

// API
import { fetchCombinedDashboardData } from '@/services/dashboard.api';

// Types
import { ICombinedDashboardData, Period } from '@/@types/dashboard.type';
import { DateRange } from 'react-day-picker';


interface DashboardOverviewProps {
  period: Period
  customRange?: DateRange
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ period, customRange }) => {
  return (
    <SingleHandler<ICombinedDashboardData, DashboardOverviewProps>
      queryFn={() => fetchCombinedDashboardData({ period })}
      storeKey="dashboardOverview"
      SingleComponent={DashboardView}
      enabled={true}
      singleProps={{
        customRange,
        period
      }}
    />
  );
};

export default DashboardOverview;
