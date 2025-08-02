import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IClientsOverview } from '@/@types/dashboard.type';

interface IClientGrowthGraphProps {
  data: IClientsOverview | null;
  loading?: boolean;
}

export const ClientGrowthGraph: React.FC<IClientGrowthGraphProps> = ({ data, loading = false }) => {
  if (!loading && !data) {
    return null;
  }

  const header = (
    <h3 className="text-lg font-semibold">Client Growth</h3>
  );

  const content = (
    <div className="space-y-4">
      <div className="flex justify-between text-sm">
        <span>Active Clients: <strong>{data?.activeClients || 0}</strong></span>
        <span>New This Period: <strong>{data?.newClientsThisMonth || 0}</strong></span>
      </div>
      {data?.clientGrowth && data.clientGrowth.length > 0 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.clientGrowth}>
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
  );

  return (
    <AppCard
      header={header}
      loading={loading}
    >
      {content}
    </AppCard>
  );
};
