import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, TrendingUp, Download, RefreshCw, DollarSign } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { dashboardApi } from '@/services/dashboard.api';
import { IDashboardRevenue } from '@/@types/dashboard.type';

interface RevenueChartProps {
  className?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [customDate, setCustomDate] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');
  const [revenue, setRevenue] = useState<IDashboardRevenue | null>(null);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getRevenueAnalytics({ period, date: customDate });
      setRevenue(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [period, customDate]);

  const exportData = () => {
    if (!revenue) return;
    
    const csvContent = [
      ['Period', 'Revenue', 'Transactions', 'Average Transaction'],
      ...revenue.revenueData.map(item => [
        item.period,
        item.totalRevenue,
        item.transactionCount || 0,
        item.averageTransaction || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.href = url;
    a.download = `revenue-analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    if (!revenue || !revenue.revenueData) return null;

    const data = revenue.revenueData.map(item => ({
      period: item.period,
      revenue: item.totalRevenue,
      transactions: item.transactionCount,
      averageTransaction: item.averageTransaction,
      pending: item.pendingRevenue
    }));

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${Number(value).toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : name === 'transactions' ? 'Transactions' : 'Avg per Transaction'
              ]}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="revenue" 
              stroke="#8884d8" 
              strokeWidth={3}
              name="Revenue"
              dot={{ fill: '#8884d8', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="transactions" 
              stroke="#82ca9d" 
              strokeWidth={2}
              name="Transactions"
              dot={{ fill: '#82ca9d' }}
            />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `$${Number(value).toFixed(2)}` : value,
                name === 'revenue' ? 'Revenue' : name === 'transactions' ? 'Transactions' : 'Avg per Transaction'
              ]}
            />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="revenue" 
              fill="#8884d8" 
              name="Revenue"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="averageTransaction" 
              stroke="#ff7300" 
              strokeWidth={2}
              name="Avg per Transaction"
            />
          </ComposedChart>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading revenue data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchRevenueData}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Revenue Analytics</h3>
            <p className="text-sm text-muted-foreground">Track revenue trends and performance</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
          
          <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'bar') => setChartType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="area">Area</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
            </SelectContent>
          </Select>
          
          <DatePicker
            value={customDate ? new Date(customDate) : undefined}
            onSelect={(date) => setCustomDate(date ? date.toISOString().split('T')[0] : '')}
            placeholder="Custom date"
          />
          
          <Button onClick={fetchRevenueData} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Button onClick={exportData} size="sm" variant="outline">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      {revenue && revenue.summary && revenue.summary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">${(revenue.summary[0]?.totalPaid || 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Total Paid</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold">{revenue.summary[0]?.totalTransactions || 0}</p>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold">${(revenue.summary[0]?.totalPending || 0).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-2xl font-bold text-green-600">
                {revenue.revenueData.length > 0 ? '↗' : '0'}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Trend</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>}
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      {revenue && revenue.revenueData && revenue.revenueData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Data Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Period</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Transactions</th>
                  <th className="text-right p-2">Avg per Transaction</th>
                </tr>
              </thead>
              <tbody>
                {revenue.revenueData.slice(-10).map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-2 font-medium">{item.period}</td>
                    <td className="p-2 text-right text-green-600 font-medium">
                      ${item.totalRevenue.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">{item.transactionCount || 0}</td>
                    <td className="p-2 text-right">
                      ${item.averageTransaction.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RevenueChart;
