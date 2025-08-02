import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { CreditCard, TrendingUp } from 'lucide-react';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodHeaderStatsProps {
  data: IPaymentMethodsOverview;
  loading?: boolean;
}

export const PaymentMethodHeaderStats: React.FC<IPaymentMethodHeaderStatsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <AppCard key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalMethods = data.paymentMethods?.length || 0;
  const activeMethods = data.paymentMethods?.filter(method => method.isEnabled).length || 0;
  const totalRevenue = data.statistics?.reduce((acc, stat) => acc + stat.totalRevenue, 0) || 0;
  const totalUsage = data.statistics?.reduce((acc, stat) => acc + stat.usageCount, 0) || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalMethods}</p>
            <p className="text-sm text-muted-foreground">Total Methods</p>
          </div>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeMethods}</p>
            <p className="text-sm text-muted-foreground">Active Methods</p>
          </div>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalUsage}</p>
            <p className="text-sm text-muted-foreground">Total Usage</p>
          </div>
        </div>
      </AppCard>
    </div>
  );
};
