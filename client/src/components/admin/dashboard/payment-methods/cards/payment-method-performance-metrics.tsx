import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodPerformanceMetricsProps {
  data: IPaymentMethodsOverview;
  loading?: boolean;
}

export const PaymentMethodPerformanceMetrics: React.FC<IPaymentMethodPerformanceMetricsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <AppCard key={i} className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </AppCard>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalMethods = data.paymentMethods?.length || 0;
  const activeMethods = data.paymentMethods?.filter(method => method.isEnabled).length || 0;
  const totalUsage = data.statistics?.reduce((acc, stat) => acc + stat.usageCount, 0) || 0;
  const totalRevenue = data.statistics?.reduce((acc, stat) => acc + stat.totalRevenue, 0) || 0;
  const enabledPercentage = totalMethods > 0 ? (activeMethods / totalMethods) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <AppCard className="p-4">
        <h4 className="font-medium mb-2">Enabled Methods</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${enabledPercentage}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {enabledPercentage.toFixed(1)}%
          </span>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <h4 className="font-medium mb-2">Total Usage Count</h4>
        <p className="text-2xl font-bold text-blue-600">{totalUsage}</p>
      </AppCard>
      
      <AppCard className="p-4">
        <h4 className="font-medium mb-2">Total Revenue</h4>
        <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
      </AppCard>
    </div>
  );
};
