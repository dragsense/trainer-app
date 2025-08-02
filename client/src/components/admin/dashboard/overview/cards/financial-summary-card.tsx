import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IFinancialSummary } from '@/@types/dashboard.type';

interface IFinancialSummaryCardProps {
  data: IFinancialSummary | null;
  loading?: boolean;
}

export const FinancialSummaryCard: React.FC<IFinancialSummaryCardProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.currentPeriod || data.currentPeriod.length === 0)) {
    return null;
  }

  const currentData = data?.currentPeriod?.[0];

  const header = (
    <h3 className="text-lg font-semibold">Financial Summary</h3>
  );

  const content = (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Total Revenue</p>
        <p className="text-2xl font-bold text-green-600">
          ${currentData?.totalRevenue?.toFixed(2) || '0.00'}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Average Transaction</p>
        <p className="text-2xl font-bold">
          ${currentData?.averageTransactionValue?.toFixed(2) || '0.00'}
        </p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Pending Revenue</p>
        <p className="text-2xl font-bold text-orange-600">
          ${currentData?.pendingRevenue?.toFixed(2) || '0.00'}
        </p>
      </div>
    </div>
  );

  const footer = (
    <div>
      <h4 className="text-md font-medium mb-4">Transaction Summary</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">
            {currentData?.paidTransactions || 0}
          </p>
          <p className="text-sm text-muted-foreground">Paid</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-orange-600">
            {currentData?.pendingTransactions || 0}
          </p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-600">
            {currentData?.failedTransactions || 0}
          </p>
          <p className="text-sm text-muted-foreground">Failed</p>
        </div>
      </div>
    </div>
  );

  return (
    <AppCard
      header={header}
      footer={!loading && currentData ? footer : undefined}
      loading={loading}
      className="col-span-full"
    >
      {content}
    </AppCard>
  );
};
