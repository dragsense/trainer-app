import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { IDashboardRevenue } from '@/@types/dashboard.type';

interface IRevenueDataTableProps {
  data: IDashboardRevenue;
  loading?: boolean;
}

export const RevenueDataTable: React.FC<IRevenueDataTableProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <AppCard className="p-6 mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data?.revenueData || data.revenueData.length === 0) {
    return null;
  }

  return (
    <AppCard className="p-6 mt-6">
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
            {data.revenueData.slice(-10).map((item, index) => (
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
    </AppCard>
  );
};
