import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IPaymentMethodsOverview } from '@/@types/dashboard.type';

interface IPaymentMethodsGraphProps {
  data: IPaymentMethodsOverview | null;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PaymentMethodsGraph: React.FC<IPaymentMethodsGraphProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.statistics || data.statistics.length === 0)) {
    return null;
  }

  const header = (
    <h3 className="text-lg font-semibold">Payment Methods Distribution</h3>
  );

  const content = (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data?.statistics || []}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ paymentMethod, usageCount }) => `${paymentMethod} (${usageCount})`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="usageCount"
            >
              {(data?.statistics || []).map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const footer = (
    <div className="space-y-2">
      {(data?.statistics || []).map((method, index) => (
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
  );

  return (
    <AppCard
      header={header}
      footer={!loading && data?.statistics?.length ? footer : undefined}
      loading={loading}
    >
      {content}
    </AppCard>
  );
};
