import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionKeyMetricsProps {
  data: ISessionsAnalytics;
  loading?: boolean;
}

export const SessionKeyMetrics: React.FC<ISessionKeyMetricsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <AppCard key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </AppCard>
        ))}
      </div>
    );
  }

  if (!data?.timeline) return null;

  const totalSessions = data.timeline.reduce((sum, item) => sum + item.totalSessions, 0);
  const cancelledSessions = data.timeline.reduce((sum, item) => sum + item.cancelledSessions, 0);
  const latestCompletionRate = data.timeline[0]?.completionRate || 0;
  const averagePrice = data.timeline[0]?.averagePrice || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </div>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {latestCompletionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </div>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{cancelledSessions}</p>
            <p className="text-sm text-muted-foreground">Cancelled Sessions</p>
          </div>
        </div>
      </AppCard>
      
      <AppCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">${averagePrice.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Avg Session Value</p>
          </div>
        </div>
      </AppCard>
    </div>
  );
};
