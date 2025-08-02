import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingDetailedStatusCardProps {
  data: IBillingAnalytics['summary'];
  loading?: boolean;
}

export const BillingDetailedStatusCard: React.FC<IBillingDetailedStatusCardProps> = ({ data, loading }) => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Convert from cents
  };

  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-lg bg-gray-100">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data) {
    return (
      <AppCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Status Breakdown</h3>
        <div className="h-32 flex items-center justify-center text-gray-500">
          No status data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Detailed Status Breakdown</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{data.paidBillings}</p>
          <p className="text-sm text-green-600">{formatCurrency(data.totalPaid)}</p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Pending</span>
          </div>
          <p className="text-2xl font-bold text-yellow-800">{data.pendingBillings}</p>
          <p className="text-sm text-yellow-600">{formatCurrency(data.totalPending)}</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-800">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-800">{data.failedBillings}</p>
          <p className="text-sm text-red-600">{formatCurrency(data.totalFailed)}</p>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-800">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-orange-800">{data.overdueBillings}</p>
          <p className="text-sm text-orange-600">{formatCurrency(data.totalOverdue)}</p>
        </div>
      </div>
    </AppCard>
  );
};
