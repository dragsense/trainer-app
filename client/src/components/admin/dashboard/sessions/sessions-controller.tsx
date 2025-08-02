import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { DashboardBaseController } from '../shared';

interface ISessionsControllerProps {
  period: 'day' | 'week' | 'month' | 'year';
  customDate: string;
  sessionType: 'all' | 'personal' | 'group' | 'online';
  statusFilter: 'all' | 'completed' | 'scheduled' | 'cancelled';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  onCustomDateChange: (date: string) => void;
  onSessionTypeChange: (sessionType: 'all' | 'personal' | 'group' | 'online') => void;
  onStatusFilterChange: (statusFilter: 'all' | 'completed' | 'scheduled' | 'cancelled') => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const SessionsController: React.FC<ISessionsControllerProps> = ({
  period,
  customDate,
  sessionType,
  statusFilter,
  onPeriodChange,
  onCustomDateChange,
  onSessionTypeChange,
  onStatusFilterChange,
  onRefresh,
  onExport
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Calendar className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Sessions Analytics</h3>
          <p className="text-sm text-muted-foreground">Track session performance and completion rates</p>
        </div>
      </div>
      
      <DashboardBaseController
        period={period}
        customDate={customDate}
        onPeriodChange={onPeriodChange}
        onCustomDateChange={onCustomDateChange}
        onRefresh={onRefresh}
        onExport={onExport}
        showExport={true}
        showRefresh={true}
      >
        {/* Session Type Filter - specific to sessions */}
        <Select value={sessionType} onValueChange={onSessionTypeChange}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="online">Online</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Status Filter - specific to sessions */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </DashboardBaseController>
    </div>
  );
};
