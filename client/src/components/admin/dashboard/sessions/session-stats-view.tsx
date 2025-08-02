import React, { useState } from 'react';
import { useStore } from 'zustand';
import { TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2 } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Button } from '@/components/ui/button';

// Components
import { SessionsController } from './sessions-controller';
import { SessionKeyMetrics, SessionSummaryCard, SessionTypesCard, SessionPerformanceInsights, SessionTimelineOverview } from './cards';
import { SessionTrendsGraph } from './graphs';

// Types
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionViewProps {
  storeKey: string;
}

export const SessionStatsView: React.FC<ISessionViewProps> = ({ storeKey }) => {
  const singleStoreKey = storeKey + "-single";
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  const [sessionType, setSessionType] = useState<'all' | 'personal' | 'group' | 'online'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'scheduled' | 'cancelled'>('all');
  
  // Get the store
  const singleStore = useRegisteredStore<TSingleHandlerStore<ISessionsAnalytics>>(singleStoreKey);

  if (!singleStore) {
    return <div>Session store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { response: data, isLoading, error } = useStore(singleStore);

  const exportData = () => {
    if (!data?.timeline) return;
    
    const csvContent = [
      ['Period', 'Total Sessions', 'Completed', 'Scheduled', 'Cancelled', 'Completion Rate'],
      ...data.timeline.map(item => [
        item.period,
        item.totalSessions || 0,
        item.completedSessions || 0,
        item.scheduledSessions || 0,
        item.cancelledSessions || 0,
        `${item.completionRate || 0}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sessions-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    // This would trigger a refetch in a real implementation
    console.log('Refreshing sessions data...');
  };

  if (isLoading) {
    return (
      <AppCard className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sessions analytics...</span>
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
          No sessions data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      {/* Controller */}
      <SessionsController
        period={period}
        customDate={customDate}
        sessionType={sessionType}
        statusFilter={statusFilter}
        onPeriodChange={setPeriod}
        onCustomDateChange={setCustomDate}
        onSessionTypeChange={setSessionType}
        onStatusFilterChange={setStatusFilter}
        onRefresh={refreshData}
        onExport={exportData}
      />

      {/* Key Metrics */}
      <SessionKeyMetrics data={data} loading={isLoading} />

      {/* Summary Card */}
      <SessionSummaryCard data={data} loading={isLoading} />

      {/* Trends Chart */}
      <SessionTrendsGraph data={data.timeline} loading={isLoading} />

      {/* Session Types and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionTypesCard data={data.sessionTypes || []} loading={isLoading} />
        <SessionPerformanceInsights data={data} loading={isLoading} />
      </div>

      {/* Timeline Overview */}
      <SessionTimelineOverview data={data} loading={isLoading} />
    </AppCard>
  );
};
