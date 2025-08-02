import React, { useState } from 'react';
import { useStore } from 'zustand';
import { TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2 } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Button } from '@/components/ui/button';

// Components
import { RevenueController } from './revenue-controller';
import { RevenueStatsSummary, RevenueDataTable } from './cards';
import { RevenueAdvancedChart } from './graphs';

// Types
import { IDashboardRevenue } from '@/@types/dashboard.type';

interface IRevenueViewProps {
  storeKey: string;
}

export const RevenueView: React.FC<IRevenueViewProps> = ({ storeKey }) => {
  const singleStoreKey = storeKey + "-single";
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  
  // Get the store
  const singleStore = useRegisteredStore<TSingleHandlerStore<IDashboardRevenue>>(singleStoreKey);

  if (!singleStore) {
    return <div>Revenue store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { response: data, isLoading, error } = useStore(singleStore);

  const exportData = () => {
    if (!data?.revenueData) return;
    
    const csvContent = [
      ['Period', 'Revenue', 'Transactions', 'Average Transaction'],
      ...data.revenueData.map(item => [
        item.period,
        item.totalRevenue,
        item.transactionCount || 0,
        item.averageTransaction || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    // This would trigger a refetch in a real implementation
    console.log('Refreshing data...');
  };

  if (isLoading) {
    return (
      <AppCard className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading revenue data...</span>
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
          No revenue data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      {/* Controller */}
      <RevenueController
        period={period}
        chartType={chartType}
        customDate={customDate}
        onPeriodChange={setPeriod}
        onChartTypeChange={setChartType}
        onCustomDateChange={setCustomDate}
        onRefresh={refreshData}
        onExport={exportData}
      />

      {/* Stats Summary */}
      <RevenueStatsSummary data={data} loading={isLoading} />

      {/* Chart */}
      <RevenueAdvancedChart 
        data={data} 
        chartType={chartType} 
        loading={isLoading} 
      />

      {/* Data Table */}
      <RevenueDataTable data={data} loading={isLoading} />
    </AppCard>
  );
};
