import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingOverviewCardProps {
  data: IBillingAnalytics | null;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const BillingOverviewCard: React.FC<IBillingOverviewCardProps> = ({ data, loading = false }) => {
  if (!loading && (!data || !data.summary)) {
    return null;
  }

  const header = (
    <h3 className="text-lg font-semibold">Billing Overview</h3>
  );

  const content = (
    <div className="space-y-4">
      {/* Billing Stats */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-blue-600">
            {data?.summary?.totalBillings || 0}
          </p>
          <p className="text-xs text-muted-foreground">Total Billings</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-600">
            ${data?.summary?.totalPaid?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </div>
      </div>
      
      {/* Status Distribution */}
      {data?.statusDistribution && data.statusDistribution.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Status Distribution</h4>
          <div className="space-y-2">
            {data.statusDistribution.slice(0, 4).map((status, index) => (
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
    </div>
  );

  const footer = (
    <div className="grid grid-cols-2 gap-4 text-center">
      <div>
        <p className="text-sm font-medium">Success Rate</p>
        <p className="text-lg font-bold text-green-600">
          {data?.summary?.overallSuccessRate?.toFixed(1) || '0.0'}%
        </p>
      </div>
      <div>
        <p className="text-sm font-medium">Avg Amount</p>
        <p className="text-lg font-bold">
          ${data?.summary?.averagePaidAmount?.toFixed(2) || '0.00'}
        </p>
      </div>
    </div>
  );

  return (
    <AppCard
      header={header}
      footer={!loading && data?.summary ? footer : undefined}
      loading={loading}
    >
      {content}
    </AppCard>
  );
};
