import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { dashboardApi } from '@/services/dashboard.api';
import { ISessionsAnalytics } from '@/@types/dashboard.type';

interface SessionAnalyticsProps {
  className?: string;
}

const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [sessions, setSessions] = useState<ISessionsAnalytics | null>(null);

  const fetchSessionsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getSessionsAnalytics({ period });
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionsData();
  }, [period]);

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

  const renderChart = () => {
    if (!sessions?.timeline || sessions.timeline.length === 0) return null;

    const data = sessions.timeline;

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completedSessions" 
              stroke="#22c55e" 
              strokeWidth={2}
              name="Completed"
            />
            <Line 
              type="monotone" 
              dataKey="cancelledSessions" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Cancelled"
            />
            <Line 
              type="monotone" 
              dataKey="scheduledSessions" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Scheduled"
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="completedSessions" 
              stackId="1"
              stroke="#22c55e" 
              fill="#22c55e"
              fillOpacity={0.6}
              name="Completed"
            />
            <Area 
              type="monotone" 
              dataKey="cancelledSessions" 
              stackId="1"
              stroke="#ef4444" 
              fill="#ef4444"
              fillOpacity={0.6}
              name="Cancelled"
            />
            <Area 
              type="monotone" 
              dataKey="scheduledSessions" 
              stackId="1"
              stroke="#f59e0b" 
              fill="#f59e0b"
              fillOpacity={0.6}
              name="Scheduled"
            />
          </AreaChart>
        );

      case 'bar':
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="completedSessions" fill="#22c55e" name="Completed" />
            <Bar dataKey="cancelledSessions" fill="#ef4444" name="Cancelled" />
            <Bar dataKey="scheduledSessions" fill="#f59e0b" name="Scheduled" />
          </BarChart>
        );
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading sessions data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSessionsData}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Session Analytics</h3>
            <p className="text-sm text-muted-foreground">Track session performance and completion rates</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'area') => setChartType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sessions?.timeline?.reduce((sum, item) => sum + item.totalSessions, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {sessions?.timeline?.[0]?.completionRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {sessions?.timeline?.reduce((sum, item) => sum + item.cancelledSessions, 0) || 0}
              </p>
              <p className="text-sm text-muted-foreground">Cancelled Sessions</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${sessions?.timeline?.[0]?.averagePrice?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">Avg Session Value</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="p-6 lg:col-span-2">
          <h4 className="font-medium mb-4">Session Trends</h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart() || <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Session Types Distribution */}
        <Card className="p-6">
          <h4 className="font-medium mb-4">Session Types Distribution</h4>
          {sessions?.sessionTypes && sessions.sessionTypes.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sessions.sessionTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type} (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {sessions.sessionTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-80 text-muted-foreground">
              No status data available
            </div>
          )}
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-medium mb-4">Performance Insights</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Completion Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${sessions?.timeline && sessions.timeline.length > 0 
                        ? (sessions.timeline.reduce((acc, item) => acc + item.completionRate, 0) / sessions.timeline.length)
                        : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {sessions?.timeline && sessions.timeline.length > 0 
                    ? (sessions.timeline.reduce((acc, item) => acc + item.completionRate, 0) / sessions.timeline.length).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Sessions</span>
              <span className="text-sm font-medium">
                {sessions?.timeline?.reduce((acc, item) => acc + item.totalSessions, 0) || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Average Price</span>
              <span className="text-sm font-medium">
                ${sessions?.timeline && sessions.timeline.length > 0 
                  ? (sessions.timeline.reduce((acc, item) => acc + item.averagePrice, 0) / sessions.timeline.length).toFixed(2)
                  : '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Potential Revenue</span>
              <span className="text-sm font-medium">
                ${sessions?.timeline?.reduce((acc, item) => acc + item.totalPotentialRevenue, 0).toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-medium mb-4">Timeline Overview</h4>
          {sessions?.timeline && sessions.timeline.length > 0 ? (
            <div className="space-y-3">
              {sessions.timeline.slice(0, 5).map((timelineItem, index) => (
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
                    <span className="text-sm font-medium">${timelineItem.totalPotentialRevenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent sessions</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SessionAnalytics;
