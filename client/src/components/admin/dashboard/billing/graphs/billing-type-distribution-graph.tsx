import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppCard } from '@/components/layout-ui/app-card';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingTypeDistributionGraphProps {
  data: IBillingAnalytics['typeDistribution'];
  loading?: boolean;
}

export const BillingTypeDistributionGraph: React.FC<IBillingTypeDistributionGraphProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AppCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AppCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Billing Type Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No type data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Billing Type Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value}`, 'Count']}
            />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
