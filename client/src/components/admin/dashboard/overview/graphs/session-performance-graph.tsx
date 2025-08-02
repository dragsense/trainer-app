import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionPerformanceGraphProps {
  data: ISessionsAnalytics | null;
  loading?: boolean;
}

export const SessionPerformanceGraph: React.FC<ISessionPerformanceGraphProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.timeline || data.timeline.length === 0)) {
    return null;
  }

  const header = (
    <h3 className="text-lg font-semibold">Session Performance</h3>
  );

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {data?.timeline?.[0]?.completionRate?.toFixed(1) || '0.0'}%
          </p>
          <p className="text-sm text-muted-foreground">Completion Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">
            {data?.timeline?.reduce((sum, item) => sum + item.totalSessions, 0) || 0}
          </p>
          <p className="text-sm text-muted-foreground">Total Sessions</p>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.timeline || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completedSessions" fill="#22c55e" name="Completed" />
            <Bar dataKey="cancelledSessions" fill="#ef4444" name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <AppCard
      header={header}
      loading={loading}
    >
      {content}
    </AppCard>
  );
};
