import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Badge } from '@/components/ui/badge';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingStatusCardProps {
  data: IBillingAnalytics['statusDistribution'];
  totalTransactions: number;
  loading?: boolean;
}

export const BillingStatusCard: React.FC<IBillingStatusCardProps> = ({ 
  data, 
  totalTransactions, 
  loading 
}) => {
  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data || data.length === 0) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
      case 'completed':
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Billing Status Distribution</h3>
      <div className="space-y-3">
        {data.map((status, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(status.status)}
              <span className="font-medium capitalize">{status.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(status.status)}>
                {status.count}
              </Badge>
              <span className="text-sm text-gray-600">
                {((status.count / totalTransactions) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  );
};
