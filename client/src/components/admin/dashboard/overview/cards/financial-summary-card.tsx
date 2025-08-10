import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IFinancialSummary } from '@/@types/dashboard.type';
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
  ResponsiveContainer
} from 'recharts';
import {
  ArrowUp,
  ArrowDown,
  CircleDollarSign,
  Percent,
  Wallet,
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface IFinancialSummaryCardProps {
  data: IFinancialSummary | null;
  loading?: boolean;
  isAdmin?: boolean
}

export const FinancialSummaryCard: React.FC<IFinancialSummaryCardProps> = ({
  data,
  loading = false,
  isAdmin = false
}) => {
  if (!loading && (!data || !data.currentPeriod || data.currentPeriod.length === 0)) {
    return null;
  }

  const currentData = data?.currentPeriod?.[0] || {
    totalRevenue: 0,
    platformRevenue: 0,
    trainerRevenue: 0,
    pendingRevenue: 0,
    paidTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    averageTransactionValue: 0,
    growthRate: 0,
    platformGrowthRate: 0,
    currency: 'USD'
  };

  // Mock timeline data - you would replace with actual data from your API
  const timelineData = [
    { period: 'Jan', revenue: 12000, platform: 240, trainer: 11760 },
    { period: 'Feb', revenue: 19000, platform: 380, trainer: 18620 },
    { period: 'Mar', revenue: 15000, platform: 300, trainer: 14700 },
    { period: 'Apr', revenue: 18000, platform: 360, trainer: 17640 },
    { period: 'May', revenue: 21000, platform: 420, trainer: 20580 },
  ];

  const transactionData = [
    { name: 'Paid', value: currentData.paidTransactions, color: '#10B981' },
    { name: 'Pending', value: currentData.pendingTransactions, color: '#F59E0B' },
    { name: 'Failed', value: currentData.failedTransactions, color: '#EF4444' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentData.currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Financial Summary</h3>
        <p className="text-sm text-muted-foreground">
          {data?.period ? `${data.period.charAt(0).toUpperCase() + data.period.slice(1)}ly` : ''} Overview
        </p>
      </div>
      {!loading && (
        <div className="flex items-center gap-2 text-sm">
          {getTrendIcon(currentData.growthRate)}
          <span className={currentData.growthRate > 0 ? 'text-green-600' : currentData.growthRate < 0 ? 'text-red-600' : ''}>
            {Math.abs(currentData.growthRate).toFixed(1)}% {currentData.growthRate > 0 ? 'growth' : 'decline'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <AppCard
      header={header}
      loading={loading}
      className="col-span-full hover:shadow-md transition-shadow"
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Total Revenue"
            value={currentData.totalRevenue}
            currency={currentData.currency}
            icon={<CircleDollarSign className="h-4 w-4 text-blue-600" />}
            trend={currentData.growthRate}
          />

          {isAdmin && (
            <MetricCard
              title="Platform Revenue"
              value={currentData.platformRevenue}
              currency={currentData.currency}
              icon={<Percent className="h-4 w-4 text-purple-600" />}
              trend={currentData.platformGrowthRate}
              subtitle="2% of total"
            />
          )}

          <MetricCard
            title={isAdmin ? "Trainer Revenue" : "Your Revenue"}
            value={currentData.trainerRevenue}
            currency={currentData.currency}
            icon={<Wallet className="h-4 w-4 text-green-600" />}
            trend={currentData.growthRate}
            subtitle={isAdmin ? "98% of total" : "After platform fees"}
          />
        </div>

        {/* Revenue Trend Chart */}
        <div className="h-64">
          <h4 className="text-sm font-medium mb-2">Revenue Trend</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Total Revenue' :
                    name === 'platform' ? 'Platform' : 'Trainer'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Total Revenue"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {isAdmin && (
                <Line
                  type="monotone"
                  dataKey="platform"
                  name="Platform"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="trainer"
                name="Trainer"
                stroke="#00C49F"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Transaction Status</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={transactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {transactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Transactions']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Transaction Metrics</h4>
            <div className="grid grid-cols-2 gap-4 h-full">
              <MetricCard
                title="Total Transactions"
                value={currentData.paidTransactions + currentData.pendingTransactions + currentData.failedTransactions}
                icon={<CreditCard className="h-4 w-4" />}
                compact
              />
              <MetricCard
                title="Avg. Transaction"
                value={currentData.averageTransactionValue}
                currency={currentData.currency}
                icon={<TrendingUp className="h-4 w-4 text-blue-600" />}
                compact
              />
              <MetricCard
                title="Pending Amount"
                value={currentData.pendingRevenue}
                currency={currentData.currency}
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                compact
              />
              <MetricCard
                title="Success Rate"
                value={(currentData.paidTransactions /
                  (currentData.paidTransactions + currentData.pendingTransactions + currentData.failedTransactions)) * 100 || 0}
                suffix="%"
                icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </AppCard>
  );
};

// Helper component for metric cards
interface MetricCardProps {
  title: string;
  value: number;
  currency?: string;
  icon: React.ReactElement<{ className?: string }>; // More specific type for icon
  trend?: number;
  subtitle?: string;
  suffix?: string;
  compact?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  currency = 'USD',
  icon,
  trend,
  subtitle,
  suffix = '',
  compact = false
}) => {
  const formattedValue = currency
    ? new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
    : `${value}${suffix}`;

  return (
    <div className={`border rounded-lg ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{title}</p>
          <p className={`${compact ? 'text-xl' : 'text-2xl'} font-bold mt-1`}>{formattedValue}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`${compact ? 'bg-gray-100 p-1.5' : 'bg-gray-100 p-2'} rounded-full`}>
          {React.cloneElement(icon, {
            className: `${icon.props.className || ''} ${compact ? 'h-3 w-3' : 'h-4 w-4'}`
          })}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 ${compact ? 'text-xs' : 'text-sm'} ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
          {trend > 0 ? <ArrowUp className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} /> : <ArrowDown className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};