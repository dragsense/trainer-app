import React from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { AppCard } from '@/components/layout-ui/app-card';
import { IDashboardRevenue } from '@/@types/dashboard.type';

interface IRevenueAdvancedChartProps {
  data: IDashboardRevenue;
  chartType: 'line' | 'area' | 'bar';
  loading?: boolean;
}

export const RevenueAdvancedChart: React.FC<IRevenueAdvancedChartProps> = ({ 
  data, 
  chartType, 
  loading 
}) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </AppCard>
    );
  }

  if (!data?.revenueData || data.revenueData.length === 0) {
    return (
      <AppCard className="p-6">
        <div className="h-80 flex items-center justify-center text-gray-500">
          No revenue data available
        </div>
      </AppCard>
    );
  }

  const chartData = data.revenueData.map(item => ({
    period: item.period,
    revenue: item.totalRevenue,
    transactions: item.transactionCount,
    averageTransaction: item.averageTransaction,
    pending: item.pendingRevenue
  }));

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${Number(value).toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : name === 'transactions' ? 'Transactions' : 'Avg per Transaction'
              ]}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#8884d8" 
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: '#8884d8', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="transactions" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Transactions"
              dot={{ fill: '#82ca9d' }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${Number(value).toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : name === 'transactions' ? 'Transactions' : 'Avg per Transaction'
              ]}
            />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              fill="#8884d8" 
              name="Revenue"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="averageTransaction" 
              stroke="#ff7300" 
              strokeWidth={2}
              name="Avg per Transaction"
            />
          </ComposedChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart() || (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
};
