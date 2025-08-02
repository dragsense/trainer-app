import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Badge } from '@/components/ui/badge';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionTypesCardProps {
  data: ISessionsAnalytics['sessionTypes'];
  loading?: boolean;
}

export const SessionTypesCard: React.FC<ISessionTypesCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Session Types</h3>
      <div className="space-y-3">
        {data.map((sessionType, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="font-medium capitalize">{sessionType.type}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">
                {sessionType.count} sessions
              </Badge>
              <span className="text-sm text-gray-600 font-medium">
                ${sessionType.averagePrice?.toFixed(2) || '0.00'} avg
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
};
