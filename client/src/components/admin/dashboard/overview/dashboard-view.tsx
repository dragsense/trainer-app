import React, { useState } from 'react';
import { useStore } from 'zustand';
import { TSingleHandlerStore, useRegisteredStore } from '@/stores';
import { Loader2, } from 'lucide-react';

// Components
import { DashboardControls } from './dashboard-controls';
import CompactDashboard from './compact-dashboard';

// Types
import { ICombinedDashboardData, Period } from '@/@types/dashboard.type';
import { DateRange } from 'react-day-picker';

interface IDashboardViewProps {
  storeKey: string;
  period: Period,
  customRange?: DateRange
}


export const DashboardView: React.FC<IDashboardViewProps> = ({ storeKey, period, customRange }) => {
  const singleStoreKey = storeKey + "-single";


  // Local state for filters


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



  return (
    <div className="space-y-6">
      <CompactDashboard data={data} error={error} period={period} customRange={customRange} isLoading={false} />
    </div >
  );
};
