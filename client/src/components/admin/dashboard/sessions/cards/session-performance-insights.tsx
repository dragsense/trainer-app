import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionPerformanceInsightsProps {
  data: ISessionsAnalytics;
  loading?: boolean;
}

export const SessionPerformanceInsights: React.FC<ISessionPerformanceInsightsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data?.timeline || data.timeline.length === 0) {
    return (
      <AppCard className="p-6">
        <h4 className="font-medium mb-4">Performance Insights</h4>
        <div className="text-center py-8 text-gray-500">
          No performance data available
        </div>
      </AppCard>
    );
  }

  const avgCompletionRate = data.timeline.reduce((acc, item) => acc + item.completionRate, 0) / data.timeline.length;
  const totalSessions = data.timeline.reduce((acc, item) => acc + item.totalSessions, 0);
  const avgPrice = data.timeline.reduce((acc, item) => acc + item.averagePrice, 0) / data.timeline.length;
  const totalPotentialRevenue = data.timeline.reduce((acc, item) => acc + item.totalPotentialRevenue, 0);

  return (
    <AppCard className="p-6">
      <h4 className="font-medium mb-4">Performance Insights</h4>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Avg Completion Rate</span>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${avgCompletionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {avgCompletionRate.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Total Sessions</span>
          <span className="text-sm font-medium">{totalSessions}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Average Price</span>
          <span className="text-sm font-medium">${avgPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm">Total Potential Revenue</span>
          <span className="text-sm font-medium">${totalPotentialRevenue.toFixed(2)}</span>
        </div>
      </div>
    </AppCard>
  );
};
