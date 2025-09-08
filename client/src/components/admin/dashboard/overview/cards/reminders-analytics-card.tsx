import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IRemindersAnalytics } from '@/@types/dashboard.type';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown,
  Mail,
  Bell,
  CalendarCheck,
  CreditCard
} from 'lucide-react';


const reminderTypeIcons = {
  EMAIL: <Mail className="h-4 w-4" />,
  NOTIFICATION: <Bell className="h-4 w-4" />,
  APPOINTMENT: <CalendarCheck className="h-4 w-4" />,
  BILLING: <CreditCard className="h-4 w-4" />,
  DEFAULT: <Bell className="h-4 w-4" />
};

interface IRemindersAnalyticsCardProps {
  data: IRemindersAnalytics | null;
  loading?: boolean;
}

export const RemindersAnalyticsCard: React.FC<IRemindersAnalyticsCardProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.reminderTypes)) {
    return null;
  }



  const header = (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Reminders Analytics</h3>
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <span>Success Rate:</span>
        <span className="font-medium text-green-600">
          {data?.timeline?.[0]?.successRate?.toFixed(1) || 0}%
        </span>
      </div>
    </div>
  );

  return (
    <AppCard
      header={header}
      loading={loading}
      className="hover:shadow-md transition-shadow"
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Reminders"
            value={data?.reminderTypes?.reduce((sum, type) => sum + type.count, 0) || 0}
            icon={<div className="bg-blue-100 p-2 rounded-full hidden md:block"><Mail className="h-4 w-4 text-blue-600" /></div>}
            trend={5.2} // Example trend value
          />
          <StatCard
            title="Successful"
            value={data?.reminderTypes?.reduce((sum, type) => sum + type.successfulCount, 0) || 0}
            icon={<div className="bg-green-100 p-2 rounded-full hidden md:block"><CheckCircle2 className="h-4 w-4 text-green-600" /></div>}
            trend={3.8}
          />
          <StatCard
            title="Pending"
            value={data?.timeline?.[0]?.pendingReminders || 0}
            icon={<div className="bg-amber-100 p-2 rounded-full hidden md:block"><Clock className="h-4 w-4 text-amber-600" /></div>}
            trend={-2.1}
          />
          <StatCard
            title="Failed"
            value={data?.timeline?.[0]?.failedReminders || 0}
            icon={<div className="bg-red-100 p-2 rounded-full hidden md:block"><AlertCircle className="h-4 w-4 text-red-600" /></div>}
            trend={1.5}
          />
        </div>

      
        {/* Reminder Type Details */}
        <div>
          <h4 className="text-sm font-medium mb-3">Reminder Type Performance</h4>
          <div className="space-y-3">
            {data?.reminderTypes?.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {reminderTypeIcons[type.type as keyof typeof reminderTypeIcons] || reminderTypeIcons.DEFAULT}
                  <span className="capitalize font-medium">{type.type.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {type.successfulCount}/{type.count} sent
                  </span>
                  <span className={`text-sm font-medium ${
                    type.successRate > 70 ? 'text-green-600' : 
                    type.successRate > 30 ? 'text-amber-500' : 'text-red-600'
                  }`}>
                    {type.successRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppCard>
  );
};

// Helper component for stat cards
const StatCard = ({ title, value, icon, trend }: { title: string; value: number; icon: React.ReactNode; trend?: number }) => (
  <div className="border rounded-lg p-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      {icon}
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-sm ${
        trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
      }`}>
        {trend > 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        <span>{Math.abs(trend)}%</span>
      </div>
    )}
  </div>
);