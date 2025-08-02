import React, { useState } from 'react';
import { useStore } from 'zustand';
import { TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2 } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Button } from '@/components/ui/button';

// Components
import { PaymentMethodsController } from './payment-methods-controller';
import { PaymentMethodSummaryCard, PaymentMethodsListCard, PaymentMethodHeaderStats, PaymentMethodPerformanceMetrics } from './cards';
import { PaymentMethodsDistributionGraph, PaymentMethodRevenueGraph } from './graphs';

// Types
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodViewProps {
  storeKey: string;
}

export const PaymentMethodView: React.FC<IPaymentMethodViewProps> = ({ storeKey }) => {
  const singleStoreKey = storeKey + "-single";
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  const [viewType, setViewType] = useState<'overview' | 'detailed'>('overview');
  
  // Get the store
  const singleStore = useRegisteredStore<TSingleHandlerStore<IPaymentMethodsOverview>>(singleStoreKey);

  if (!singleStore) {
    return <div>Payment Method store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { response: data, isLoading, error } = useStore(singleStore);

  const refreshData = () => {
    // This would trigger a refetch in a real implementation
    console.log('Refreshing payment methods data...');
  };

  const addPaymentMethod = () => {
    // This would open a modal/form to add new payment method
    console.log('Add payment method...');
  };

  if (isLoading) {
    return (
      <AppCard className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading payment method analytics...</span>
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
          No payment method data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      {/* Controller */}
      <PaymentMethodsController
        period={period}
        customDate={customDate}
        viewType={viewType}
        onPeriodChange={setPeriod}
        onCustomDateChange={setCustomDate}
        onViewTypeChange={setViewType}
        onRefresh={refreshData}
        onAddPaymentMethod={addPaymentMethod}
      />

      {/* Header Stats */}
      <PaymentMethodHeaderStats data={data} loading={isLoading} />

      {/* Summary Card */}
      <PaymentMethodSummaryCard data={data} loading={isLoading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethodsDistributionGraph data={data.statistics || []} loading={isLoading} />
        <PaymentMethodRevenueGraph data={data.statistics || []} loading={isLoading} />
      </div>

      {/* Performance Metrics */}
      <PaymentMethodPerformanceMetrics data={data} loading={isLoading} />

      {/* Payment Methods List */}
      <PaymentMethodsListCard data={data} loading={isLoading} />
    </AppCard>
  );
};
