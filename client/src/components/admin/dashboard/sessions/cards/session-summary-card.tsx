import React from 'react';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionSummaryCardProps {
  data: ISessionsAnalytics;
  loading?: boolean;
}

export const SessionSummaryCard: React.FC<ISessionSummaryCardProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <AppCard key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </AppCard>
        ))}
      </div>
    );
  }

  if (!data || !data.timeline?.length) return null;

  const currentPeriod = data.timeline[data.timeline.length - 1];
  const totalSessions = currentPeriod?.totalSessions || 0;
  const completedSessions = currentPeriod?.completedSessions || 0;
  const scheduledSessions = currentPeriod?.scheduledSessions || 0;
  const completionRate = currentPeriod?.completionRate || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalSessions.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              {completedSessions.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold text-gray-900">
              {scheduledSessions.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </AppCard>

      <AppCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {completionRate.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </AppCard>
    </div>
  );
};
