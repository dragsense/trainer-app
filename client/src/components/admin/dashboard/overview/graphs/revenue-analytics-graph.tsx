import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IDashboardRevenue } from '@/@types/dashboard.type';

interface IRevenueAnalyticsGraphProps {
  data: IDashboardRevenue | null;
  loading?: boolean;
}

export const RevenueAnalyticsGraph: React.FC<IRevenueAnalyticsGraphProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.revenueData || data.revenueData.length === 0)) {
    return null;
  }

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Revenue Analytics</h3>
        <p className="text-sm text-muted-foreground">Track revenue trends over time</p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="h-4 w-4 text-green-600" />
        <span className="text-green-600">Revenue Analytics</span>
      </div>
    </div>
  );

  const content = (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data?.revenueData || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
          <Area 
            type="monotone" 
            dataKey="totalRevenue" 
            stroke="#8884d8" 
            fill="#8884d8" 
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <AppCard
      header={header}
      loading={loading}
      className="col-span-full"
    >
      {content}
    </AppCard>
  );
};
