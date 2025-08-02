import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionTimelineOverviewProps {
  data: ISessionsAnalytics;
  loading?: boolean;
}

export const SessionTimelineOverview: React.FC<ISessionTimelineOverviewProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
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
        <h4 className="font-medium mb-4">Timeline Overview</h4>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent sessions</p>
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      <h4 className="font-medium mb-4">Timeline Overview</h4>
      <div className="space-y-3">
        {data.timeline.slice(0, 5).map((timelineItem, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium text-sm">{timelineItem.period}</p>
                <p className="text-xs text-muted-foreground">
                  {timelineItem.totalSessions} total sessions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {timelineItem.completionRate.toFixed(1)}% completion
              </Badge>
              <span className="text-sm font-medium">
                ${timelineItem.totalPotentialRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
};
