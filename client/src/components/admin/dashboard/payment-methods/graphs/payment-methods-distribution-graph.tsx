import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AppCard } from '@/components/layout-ui/app-card';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodsDistributionGraphProps {
  data: IPaymentMethodsOverview['statistics'];
  loading?: boolean;
}

export const PaymentMethodsDistributionGraph: React.FC<IPaymentMethodsDistributionGraphProps> = ({ data, loading }) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff8042'];

  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-56 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </AppCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AppCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No payment method data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Payment Methods Usage Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="usageCount"
              nameKey="paymentMethod"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
