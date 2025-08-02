import React from 'react';
import { CreditCard, TrendingUp, Users, DollarSign } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodSummaryCardProps {
  data: IPaymentMethodsOverview;
  loading?: boolean;
}

export const PaymentMethodSummaryCard: React.FC<IPaymentMethodSummaryCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <AppCard key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </AppCard>
        ))}
      </div>
    );
  }

  if (!data || !data.statistics?.length) return null;

  const totalMethods = data.statistics.length;
  const totalRevenue = data.statistics.reduce((sum, method) => sum + method.totalRevenue, 0);
  const totalUsage = data.statistics.reduce((sum, method) => sum + method.usageCount, 0);
  const activeMethods = data.statistics.filter(method => method.isEnabled).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Methods</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalMethods}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Methods</p>
            <p className="text-2xl font-bold text-gray-900">
              {activeMethods}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Users className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Usage</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalUsage.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </AppCard>
    </div>
  );
};
