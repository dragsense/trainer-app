import React from 'react';
import { z } from 'zod';

// Handlers
import { SingleHandler } from '@/handlers';

// Components
import { RevenueView } from '@/components/admin';

// API
import { fetchRevenueAnalytics } from '@/services/dashboard.api';

// Types
import { IDashboardRevenue } from '@/@types/dashboard.type';

const RevenueChart: React.FC = () => {
  return (
    <SingleHandler<IDashboardRevenue, Record<string, never>, IDashboardRevenue>
      queryFn={() => fetchRevenueAnalytics()}
      storeKey="revenueChart"
      SingleComponent={RevenueView}
      FormComponent={() => <div></div>}
      initialValues={{} as Record<string, never>}
      validationSchema={z.object({})}
      id={1}
    />
  );
};

export default RevenueChart;
