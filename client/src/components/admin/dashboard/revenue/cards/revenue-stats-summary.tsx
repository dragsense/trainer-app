import React from 'react';
import { TrendingUp } from 'lucide-react';
import { IDashboardRevenue } from '@/@types/dashboard.type';

interface IRevenueStatsSummaryProps {
  data: IDashboardRevenue;
  loading?: boolean;
}

export const RevenueStatsSummary: React.FC<IRevenueStatsSummaryProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse text-center p-4 bg-gray-50 rounded-lg">
            <div className="h-8 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data?.summary || data.summary.length === 0) {
    return null;
  }

  const summary = data.summary[0];
  const hasUpwardTrend = data.revenueData && data.revenueData.length > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold text-green-600">
          ${(summary.totalPaid || 0).toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">Total Paid</p>
      </div>
      
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold">
          {summary.totalTransactions || 0}
        </p>
        <p className="text-sm text-muted-foreground">Total Transactions</p>
      </div>
      
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-2xl font-bold">
          ${(summary.totalPending || 0).toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">Pending</p>
      </div>
      
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-center gap-1">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <p className="text-2xl font-bold text-green-600">
            {hasUpwardTrend ? '↗' : '0'}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Trend</p>
      </div>
    </div>
  );
};
