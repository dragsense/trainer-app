import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AppCard } from '@/components/layout-ui/app-card';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingRecentTrendsGraphProps {
  data: IBillingAnalytics['recentTrends'];
  loading?: boolean;
}

export const BillingRecentTrendsGraph: React.FC<IBillingRecentTrendsGraphProps> = ({ data, loading }) => {
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
        <h3 className="text-lg font-semibold mb-4">Recent Daily Trends (Last 30 Days)</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No recent trends data available
        </div>
      </AppCard>
    );
  }

  const chartData = data.slice(0, 15).map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString(),
    dailyRevenue: item.dailyRevenue / 100 // Convert from cents
  }));

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Daily Trends (Last 30 Days)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value: number, name: string) => {
                if (name === 'Daily Count') return [value, name];
                return [`$${value.toFixed(2)}`, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="dailyCount" fill="#6366f1" name="Daily Count" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="dailyRevenue" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Daily Revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
