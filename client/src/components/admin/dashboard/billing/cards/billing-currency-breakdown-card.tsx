import React from 'react';
import { AppCard } from '@/components/layout-ui/app-card';
import { Badge } from '@/components/ui/badge';
import { IBillingAnalytics } from '@/@types/dashboard.type';

interface IBillingCurrencyBreakdownCardProps {
  data: IBillingAnalytics['currencyBreakdown'];
  loading?: boolean;
}

export const BillingCurrencyBreakdownCard: React.FC<IBillingCurrencyBreakdownCardProps> = ({ data, loading }) => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount / 100); // Convert from cents
  };

  if (loading) {
    return (
      <AppCard className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AppCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Currency Breakdown</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No currency data available
        </div>
      </AppCard>
    );
  }

  return (
    <AppCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Currency Breakdown</h3>
      <div className="space-y-4">
        {data.map((currency, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{currency.currency.toUpperCase()}</h4>
              <Badge 
                variant="secondary"
                className={
                  currency.conversionRate > 70 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }
              >
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
    </AppCard>
  );
};
