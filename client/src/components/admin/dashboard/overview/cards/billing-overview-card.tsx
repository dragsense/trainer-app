import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IBillingAnalytics } from '@/@types/dashboard.type';
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
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];


interface IBillingOverviewCardProps {
  data: IBillingAnalytics | null;
  loading?: boolean;
}

export const BillingOverviewCard: React.FC<IBillingOverviewCardProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.summary)) {
    return null;
  }

  // Process data for charts
  const timelineData = data?.timeline?.slice(0, 6).reverse() || [];
  const statusData = data?.statusDistribution?.map((status, index) => ({
    name: status.status,
    value: status.count,
    amount: status.totalAmount,
    color: COLORS[index % COLORS.length]
  })) || [];

  const paymentMethodData = data?.paymentPerformance?.map(method => ({
    name: method.paymentMethod,
    successRate: method.successRate,
    count: method.totalCount
  })) || [];

  const currencyData = data?.currencyBreakdown?.map(currency => ({
    name: currency.currency,
    value: currency.paidAmount
  })) || [];

  const header = (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Billing Analytics</h3>
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <span>Success Rate:</span>
        <span className="font-medium text-green-600">
          {data?.summary?.overallSuccessRate?.toFixed(1) || 0}%
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
     
        {/* Status and Payment Method Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Billing Status</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} ($${props.payload.amount})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-64">
            <h4 className="text-sm font-medium mb-2">Payment Methods</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'successRate' ? `${value}%` : value,
                    name === 'successRate' ? 'Success Rate' : 'Count'
                  ]}
                />
                <Legend />
                <Bar dataKey="successRate" name="Success Rate" fill="#00C49F" />
                <Bar dataKey="count" name="Total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

     
      </div>
    </AppCard>
  );
};

