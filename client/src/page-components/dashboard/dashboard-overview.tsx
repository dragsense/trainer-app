import React from 'react';

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { DashboardView } from '@/components/admin';

// API
import { fetchCombinedDashboardData } from '@/services/dashboard.api';

// Types
import { ICombinedDashboardData } from '@/@types/dashboard.type';

const DashboardOverview: React.FC = () => {
  return (
    <SingleHandler<ICombinedDashboardData, ICombinedDashboardData>
      queryFn={() => fetchCombinedDashboardData()}
      storeKey="dashboardOverview"
      SingleComponent={DashboardView}
      enabled={true}
    />
  );
};

export default DashboardOverview;
