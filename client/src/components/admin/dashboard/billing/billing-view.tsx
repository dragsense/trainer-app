import React, { useState } from 'react';
import { useStore } from 'zustand';
import { TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2 } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Button } from '@/components/ui/button';

// Components
import { BillingController } from './billing-controller';
import { BillingSummaryCard, BillingStatusCard, BillingCurrencyBreakdownCard, BillingDetailedStatusCard } from './cards';
import { BillingTrendsGraph, BillingPaymentMethodsGraph, BillingTypeDistributionGraph, BillingRecentTrendsGraph } from './graphs';

// Types
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingViewProps {
  storeKey: string;
}

export const BillingView: React.FC<IBillingViewProps> = ({ storeKey }) => {
  const singleStoreKey = storeKey + "-single";
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  
  // Get the store
  const singleStore = useRegisteredStore<TSingleHandlerStore<IBillingAnalytics>>(singleStoreKey);

  if (!singleStore) {
    return <div>Billing store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { response: data, isLoading, error } = useStore(singleStore);

  const exportData = () => {
    if (!data?.timeline) return;
    
    const csvContent = [
      ['Period', 'Paid Amount', 'Total Billings', 'Success Rate'],
      ...data.timeline.map(item => [
        item.period,
        item.paidAmount || 0,
        item.totalBillings || 0,
        `${item.successRate || 0}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    // This would trigger a refetch in a real implementation
    console.log('Refreshing billing data...');
  };

  if (isLoading) {
    return (
      <AppCard className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading billing analytics...</span>
        </div>
      </AppCard>
    );
  }

  if (error) {
    return (
      <AppCard className="p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">Error: {error.message}</p>
          <Button onClick={refreshData}>Retry</Button>
        </div>
      </AppCard>
    );
  }

  if (!data) {
    return (
      <AppCard className="p-6">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No billing data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      {/* Controller */}
      <BillingController
        period={period}
        chartType={chartType}
        customDate={customDate}
        onPeriodChange={setPeriod}
        onChartTypeChange={setChartType}
        onCustomDateChange={setCustomDate}
        onRefresh={refreshData}
        onExport={exportData}
      />

      {/* Summary Cards */}
      <BillingSummaryCard data={data.summary} loading={isLoading} />

      {/* Trends Chart */}
      <BillingTrendsGraph data={data.timeline} loading={isLoading} />

      {/* Payment Methods and Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillingPaymentMethodsGraph data={data.paymentPerformance} loading={isLoading} />
        <BillingStatusCard 
          data={data.statusDistribution} 
          totalTransactions={data.summary?.totalBillings || 0}
          loading={isLoading} 
        />
      </div>

      {/* Type Distribution and Currency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillingTypeDistributionGraph data={data.typeDistribution} loading={isLoading} />
        <BillingCurrencyBreakdownCard data={data.currencyBreakdown} loading={isLoading} />
      </div>

      {/* Detailed Status Breakdown */}
      <BillingDetailedStatusCard data={data.summary} loading={isLoading} />

      {/* Recent Trends */}
      <BillingRecentTrendsGraph data={data.recentTrends} loading={isLoading} />
    </AppCard>
  );
};
