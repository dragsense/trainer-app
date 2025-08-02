import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard } from 'lucide-react';
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
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import { dashboardApi } from '@/services/dashboard.api';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface BillingAnalyticsProps {
  className?: string;
}

const BillingAnalytics: React.FC<BillingAnalyticsProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingData, setBillingData] = useState<IBillingAnalytics | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getBillingAnalytics({ period });
      setBillingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [period]);

  const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#06b6d4'];

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Convert from cents
  };

  const renderRevenueChart = () => {
    if (!billingData?.timeline || billingData.timeline.length === 0) return null;

    const data = billingData.timeline.map(item => ({
      period: new Date(item.period).toLocaleDateString(),
      paidAmount: item.paidAmount / 100,
      pendingAmount: item.pendingAmount / 100,
      failedAmount: item.failedAmount / 100,
      overdueAmount: item.overdueAmount / 100,
      totalBillings: item.totalBillings,
      successRate: item.successRate
    }));

    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="paidAmount" 
              stackId="1"
              stroke="#22c55e" 
              fill="#22c55e"
              name="Paid Amount"
            />
            <Area 
              type="monotone" 
              dataKey="pendingAmount" 
              stackId="1"
              stroke="#f59e0b" 
              fill="#f59e0b"
              name="Pending Amount"
            />
            <Area 
              type="monotone" 
              dataKey="overdueAmount" 
              stackId="1"
              stroke="#ef4444" 
              fill="#ef4444"
              name="Overdue Amount"
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Bar dataKey="paidAmount" fill="#22c55e" name="Paid Amount" />
            <Bar dataKey="pendingAmount" fill="#f59e0b" name="Pending Amount" />
            <Bar dataKey="overdueAmount" fill="#ef4444" name="Overdue Amount" />
          </BarChart>
        );
      default:
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'Success Rate') return [`${value.toFixed(1)}%`, name];
                return [`$${value.toFixed(2)}`, name];
              }}
              labelFormatter={(label) => `Period: ${label}`}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="paidAmount" fill="#22c55e" name="Paid Amount" />
            <Bar yAxisId="left" dataKey="pendingAmount" fill="#f59e0b" name="Pending Amount" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="successRate" 
              stroke="#6366f1" 
              strokeWidth={3}
              name="Success Rate (%)"
            />
          </ComposedChart>
        );
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading billing analytics...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchBillingData}>Retry</Button>
        </div>
      </Card>
    );
  }

  if (!billingData || !billingData.summary) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          No billing data available
        </div>
      </Card>
    );
  }

  const { summary } = billingData;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Billing Analytics</h2>
          <p className="text-muted-foreground">Comprehensive billing performance and trends</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="area">Area</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.totalBillings}</p>
              <p className="text-sm text-muted-foreground">Total Billings</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</p>
              <p className="text-sm text-muted-foreground">Total Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{summary.overallSuccessRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Timeline Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Revenue Timeline</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{period} view</Badge>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderRevenueChart() || <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Status and Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          {billingData.statusDistribution && billingData.statusDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={billingData.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status} (${count})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {billingData.statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No status data available
            </div>
          )}
        </Card>

        {/* Type Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Billing Type Distribution</h3>
          {billingData.typeDistribution && billingData.typeDistribution.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={billingData.typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value}`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No type data available
            </div>
          )}
        </Card>
      </div>

      {/* Payment Performance and Currency Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Method Performance</h3>
          {billingData.paymentPerformance && billingData.paymentPerformance.length > 0 ? (
            <div className="space-y-4">
              {billingData.paymentPerformance.map((method, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium capitalize">{method.paymentMethod}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.totalCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(method.successAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {method.successRate.toFixed(1)}% success
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No payment method data available
            </div>
          )}
        </Card>

        {/* Currency Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Currency Breakdown</h3>
          {billingData.currencyBreakdown && billingData.currencyBreakdown.length > 0 ? (
            <div className="space-y-4">
              {billingData.currencyBreakdown.map((currency, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{currency.currency.toUpperCase()}</h4>
                    <Badge className={currency.conversionRate > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                      {currency.conversionRate.toFixed(1)}% conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Billings</p>
                      <p className="font-medium">{currency.totalBillings}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid Amount</p>
                      <p className="font-medium">{formatCurrency(currency.paidAmount, currency.currency)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No currency data available
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Status Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Status Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Paid</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{summary.paidBillings}</p>
            <p className="text-sm text-green-600">{formatCurrency(summary.totalPaid)}</p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-800">{summary.pendingBillings}</p>
            <p className="text-sm text-yellow-600">{formatCurrency(summary.totalPending)}</p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-800">{summary.failedBillings}</p>
            <p className="text-sm text-red-600">{formatCurrency(summary.totalFailed)}</p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-orange-800">{summary.overdueBillings}</p>
            <p className="text-sm text-orange-600">{formatCurrency(summary.totalOverdue)}</p>
          </div>
        </div>
      </Card>

      {/* Recent Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Daily Trends (Last 30 Days)</h3>
        {billingData.recentTrends && billingData.recentTrends.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={billingData.recentTrends.slice(0, 15)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                  formatter={(value: number, name: string) => {
                    if (name === 'Daily Count') return [value, name];
                    return [`$${(value / 100).toFixed(2)}`, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="dailyCount" fill="#6366f1" name="Daily Count" />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="dailyRevenue" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Daily Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No recent trends data available
          </div>
        )}
      </Card>
    </div>
  );
};

export default BillingAnalytics;
