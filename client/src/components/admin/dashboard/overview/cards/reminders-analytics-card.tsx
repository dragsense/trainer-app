import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IRemindersAnalytics } from '@/@types/dashboard.type';

interface IRemindersAnalyticsCardProps {
  data: IRemindersAnalytics | null;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const RemindersAnalyticsCard: React.FC<IRemindersAnalyticsCardProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.reminderTypes)) {
    return null;
  }

  const header = (
    <h3 className="text-lg font-semibold">Reminders & Notifications</h3>
  );

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-lg font-bold">
            {data?.reminderTypes?.reduce((sum, type) => sum + type.count, 0) || 0}
          </p>
          <p className="text-xs text-muted-foreground">Total Reminders</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">
            {data?.reminderTypes?.reduce((sum, type) => sum + type.successfulCount, 0) || 0}
          </p>
          <p className="text-xs text-muted-foreground">Sent</p>
        </div>
      </div>
    </div>
  );

  const footer = (
    <div className="space-y-2">
      {(data?.reminderTypes || []).map((type, index) => (
        <div key={type.type} className="flex justify-between text-sm">
          <span className="capitalize">{type.type}</span>
          <div className="flex items-center gap-2">
            <div 
              className="w-12 h-2 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span>{type.count}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AppCard
      header={header}
      footer={!loading && data?.reminderTypes?.length ? footer : undefined}
      loading={loading}
    >
      {content}
    </AppCard>
  );
};
