import React from 'react';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingSummaryCardProps {
  data: IBillingAnalytics['summary'];
  loading?: boolean;
}

export const BillingSummaryCard: React.FC<IBillingSummaryCardProps> = ({ data, loading }) => {
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

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Paid</p>
            <p className="text-2xl font-bold text-gray-900">
              ${data.totalPaid?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.overallSuccessRate?.toFixed(1) || '0'}%
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Billings</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.totalBillings?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <CreditCard className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Avg Billing</p>
            <p className="text-2xl font-bold text-gray-900">
              ${data.averageBillingAmount?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="p-3 bg-orange-100 rounded-full">
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </AppCard>
    </div>
  );
};
