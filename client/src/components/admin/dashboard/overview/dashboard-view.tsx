import React, { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2, Users, Calendar, Target, CreditCard, TrendingUp } from 'lucide-react';

// Components
import { DashboardControls } from './dashboard-controls';
import { StatsCard, RemindersAnalyticsCard, BillingOverviewCard, FinancialSummaryCard } from './cards';
import { RevenueAnalyticsGraph, PaymentMethodsGraph, SessionPerformanceGraph, ClientGrowthGraph } from './graphs';

// Types
import { ICombinedDashboardData } from '@/@types/dashboard.type';

interface IDashboardViewProps {
  storeKey: string;
}


export const DashboardView: React.FC<IDashboardViewProps> = ({ storeKey }) => {
  const singleStoreKey = storeKey + "-single";
  
  // Local state for filters
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  
  // Get the store
  const singleStore = useRegisteredStore<TSingleHandlerStore<ICombinedDashboardData>>(singleStoreKey);

  if (!singleStore) {
    return <div>Dashboard store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { response: data, isLoading, error } = useStore(singleStore);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Error: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return <div>No dashboard data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <DashboardControls
        period={period}
        setPeriod={setPeriod}
        customDate={customDate}
        setCustomDate={setCustomDate}
      />

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Users"
          value={data.stats.overview?.totalClients || 0}
          icon={<Users className="h-5 w-5 text-white" />}
          color="bg-blue-500"
          change={0}
          loading={isLoading}
        />
        <StatsCard
          title="Active Sessions"
          value={data.stats.overview?.activeSessions || 0}
          icon={<Calendar className="h-5 w-5 text-white" />}
          color="bg-green-500"
          change={0}
          loading={isLoading}
        />
        <StatsCard
          title="Total Sessions"
          value={data.stats.overview?.totalSessions || 0}
          icon={<Target className="h-5 w-5 text-white" />}
          color="bg-purple-500"
          change={0}
          loading={isLoading}
        />
        <StatsCard
          title="Payment Methods"
          value={data.stats.overview?.totalBillings || 0}
          icon={<CreditCard className="h-5 w-5 text-white" />}
          color="bg-orange-500"
          loading={isLoading}
        />
        {data.billing && data.billing.summary && (
          <StatsCard
            title="Billing Success"
            value={`${data.billing.summary.overallSuccessRate?.toFixed(1) || '0.0'}%`}
            icon={<TrendingUp className="h-5 w-5 text-white" />}
            color="bg-emerald-500"
            loading={isLoading}
          />
        )}
      </div>

      {/* Revenue Analytics */}
      <RevenueAnalyticsGraph data={data.revenue} loading={isLoading} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethodsGraph data={data.paymentMethods} loading={isLoading} />
        <SessionPerformanceGraph data={data.sessions} loading={isLoading} />
        <ClientGrowthGraph data={data.clients} loading={isLoading} />
        <RemindersAnalyticsCard data={data.reminders} loading={isLoading} />
        <BillingOverviewCard data={data.billing} loading={isLoading} />
      </div>

      {/* Financial Summary */}
      <FinancialSummaryCard data={data.financial} loading={isLoading} />
    </div>
  );
};
