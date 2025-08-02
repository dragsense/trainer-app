import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { AppCard } from '@/components/layout-ui/app-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface ISessionTrendsGraphProps {
  data: ISessionsAnalytics['timeline'];
  loading?: boolean;
}

export const SessionTrendsGraph: React.FC<ISessionTrendsGraphProps> = ({ data, loading }) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </AppCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AppCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Session Trends Over Time</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No session data available
        </div>
      </AppCard>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completedSessions" fill="#4ade80" name="Completed" />
            <Bar dataKey="scheduledSessions" fill="#3b82f6" name="Scheduled" />
            <Bar dataKey="cancelledSessions" fill="#f87171" name="Cancelled" />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="completedSessions" stackId="1" fill="#4ade80" name="Completed" />
            <Area type="monotone" dataKey="scheduledSessions" stackId="1" fill="#3b82f6" name="Scheduled" />
            <Area type="monotone" dataKey="cancelledSessions" stackId="1" fill="#f87171" name="Cancelled" />
          </AreaChart>
        );
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completedSessions" stroke="#4ade80" name="Completed" strokeWidth={2} />
            <Line type="monotone" dataKey="scheduledSessions" stroke="#3b82f6" name="Scheduled" strokeWidth={2} />
            <Line type="monotone" dataKey="cancelledSessions" stroke="#f87171" name="Cancelled" strokeWidth={2} />
          </LineChart>
        );
    }
  };

  return (
    <AppCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Session Trends Over Time</h3>
        <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="area">Area</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </AppCard>
  );
};
