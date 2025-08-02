import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, TrendingUp, Users, CreditCard, Calendar, Target, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '@/services/dashboard.api';
import { 
  IDashboardStats, 
  IDashboardRevenue, 
  IPaymentMethodsOverview, 
  ISessionsAnalytics, 
  IClientsOverview, 
  IRemindersAnalytics, 
  IFinancialSummary,
  IBillingAnalytics
} from '@/@types/dashboard.type';

const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  
  // Dashboard data state
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [revenue, setRevenue] = useState<IDashboardRevenue | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodsOverview | null>(null);
  const [sessions, setSessions] = useState<ISessionsAnalytics | null>(null);
  const [clients, setClients] = useState<IClientsOverview | null>(null);
  const [reminders, setReminders] = useState<IRemindersAnalytics | null>(null);
  const [financial, setFinancial] = useState<IFinancialSummary | null>(null);
  const [billing, setBilling] = useState<IBillingAnalytics | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsData,
        revenueData,
        paymentMethodsData,
        sessionsData,
        clientsData,
        remindersData,
        financialData,
        billingData
      ] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRevenueAnalytics({ period, date: customDate }),
        dashboardApi.getPaymentMethodsOverview(),
        dashboardApi.getSessionsAnalytics({ period }),
        dashboardApi.getClientsOverview({ period }),
        dashboardApi.getRemindersAnalytics({ period }),
        dashboardApi.getFinancialSummary({ period }),
        dashboardApi.getBillingAnalytics({ 
          period: period === 'day' ? 'daily' : period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'yearly' 
        })
      ]);

      setStats(statsData);
      setRevenue(revenueData);
      setPaymentMethods(paymentMethodsData);
      setSessions(sessionsData);
      setClients(clientsData);
      setReminders(remindersData);
      setFinancial(financialData);
      setBilling(billingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period, customDate]);

  const renderStatCard = (title: string, value: number | string, icon: React.ReactNode, color: string, change?: number) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
            {change !== undefined && (
              <div className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
    
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker
            value={customDate ? new Date(customDate) : undefined}
            onSelect={(date) => setCustomDate(date ? date.toISOString().split('T')[0] : '')}
            placeholder="Custom date"
          />
          <Button onClick={fetchDashboardData} size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {renderStatCard(
            'Total Users',
            stats.overview?.totalClients || 0,
            <Users className="h-5 w-5 text-white" />,
            'bg-blue-500',
            0 // No growth data in current interface
          )}
          {renderStatCard(
            'Active Sessions',
            stats.overview?.activeSessions || 0,
            <Calendar className="h-5 w-5 text-white" />,
            'bg-green-500',
            0 // No growth data in current interface
          )}
          {renderStatCard(
            'Total Sessions',
            stats.overview?.totalSessions || 0,
            <Target className="h-5 w-5 text-white" />,
            'bg-purple-500',
            0 // No growth data in current interface
          )}
          {renderStatCard(
            'Payment Methods',
            stats.overview?.totalBillings || 0,
            <CreditCard className="h-5 w-5 text-white" />,
            'bg-orange-500'
          )}
          {billing && billing.summary && renderStatCard(
            'Billing Success',
            `${billing.summary.overallSuccessRate?.toFixed(1) || '0.0'}%`,
            <TrendingUp className="h-5 w-5 text-white" />,
            'bg-emerald-500'
          )}
        </div>
      )}

      {/* Revenue Analytics */}
      {revenue && revenue.revenueData && revenue.revenueData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Analytics</h3>
              <p className="text-sm text-muted-foreground">Track revenue trends over time</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Revenue Analytics</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        {paymentMethods && paymentMethods.statistics && paymentMethods.statistics.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Methods Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods.statistics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ paymentMethod, usageCount }) => `${paymentMethod} (${usageCount})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="usageCount"
                  >
                    {paymentMethods.statistics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {paymentMethods.statistics.map((method, index) => (
                <div key={method.paymentMethod} className="flex justify-between text-sm">
                  <span className="capitalize">{method.paymentMethod}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{method.usageCount} uses</span>
                    <span className="text-muted-foreground">${method.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Session Completion Rates */}
        {sessions && sessions.timeline && sessions.timeline.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Session Performance</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {sessions.timeline[0]?.completionRate?.toFixed(1) || '0.0'}%
                  </p>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {sessions.timeline.reduce((sum, item) => sum + item.totalSessions, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessions.timeline}>
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
          </Card>
        )}

        {/* Client Growth */}
        {clients && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Client Growth</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Active Clients: <strong>{clients.activeClients || 0}</strong></span>
                <span>New This Period: <strong>{clients.newClientsThisMonth || 0}</strong></span>
              </div>
              {clients.clientGrowth && clients.clientGrowth.length > 0 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clients.clientGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="newClients" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Reminders Analytics */}
        {reminders && reminders.reminderTypes && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Reminders & Notifications</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">
                    {reminders.reminderTypes.reduce((sum, type) => sum + type.count, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Reminders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">
                    {reminders.reminderTypes.reduce((sum, type) => sum + type.successfulCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
              </div>
              <div className="space-y-2">
                {reminders.reminderTypes.map((type, index) => (
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
            </div>
          </Card>
        )}

        {/* Billing Overview */}
        {billing && billing.summary && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Billing Overview</h3>
            <div className="space-y-4">
              {/* Billing Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">
                    {billing.summary.totalBillings || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Billings</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">
                    ${billing.summary.totalPaid?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                </div>
              </div>
              
              {/* Status Distribution */}
              {billing.statusDistribution && billing.statusDistribution.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Status Distribution</h4>
                  <div className="space-y-2">
                    {billing.statusDistribution.slice(0, 4).map((status, index) => (
                      <div key={status.status} className="flex justify-between text-sm">
                        <span className="capitalize">{status.status}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{status.count}</span>
                          <span className="text-muted-foreground">${status.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Performance */}
              <div className="pt-2 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium">Success Rate</p>
                    <p className="text-lg font-bold text-green-600">
                      {billing.summary.overallSuccessRate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avg Amount</p>
                    <p className="text-lg font-bold">
                      ${billing.summary.averagePaidAmount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Financial Summary */}
      {financial && financial.currentPeriod && financial.currentPeriod.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${financial.currentPeriod[0]?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Transaction</p>
              <p className="text-2xl font-bold">
                ${financial.currentPeriod[0]?.averageTransactionValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Pending Revenue</p>
              <p className="text-2xl font-bold text-orange-600">
                ${financial.currentPeriod[0]?.pendingRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-md font-medium mb-4">Transaction Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">
                  {financial.currentPeriod[0]?.paidTransactions || 0}
                </p>
                <p className="text-sm text-muted-foreground">Paid</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-orange-600">
                  {financial.currentPeriod[0]?.pendingTransactions || 0}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {financial.currentPeriod[0]?.failedTransactions || 0}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardOverview;
