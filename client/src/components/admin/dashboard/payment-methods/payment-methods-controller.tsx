import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CreditCard, Plus } from 'lucide-react';
import { DashboardBaseController } from '../shared';

interface IPaymentMethodsControllerProps {
  period: 'day' | 'week' | 'month' | 'year';
  customDate: string;
  viewType: 'overview' | 'detailed';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  onCustomDateChange: (date: string) => void;
  onViewTypeChange: (viewType: 'overview' | 'detailed') => void;
  onRefresh: () => void;
  onAddPaymentMethod?: () => void;
}

export const PaymentMethodsController: React.FC<IPaymentMethodsControllerProps> = ({
  period,
  customDate,
  viewType,
  onPeriodChange,
  onCustomDateChange,
  onViewTypeChange,
  onRefresh,
  onAddPaymentMethod
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <CreditCard className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">Manage and analyze payment method performance</p>
        </div>
      </div>
      
      <DashboardBaseController
        period={period}
        customDate={customDate}
        onPeriodChange={onPeriodChange}
        onCustomDateChange={onCustomDateChange}
        onRefresh={onRefresh}
        showExport={false}
        showRefresh={true}
      >
        {/* View Type Selector - specific to payment methods */}
        <Select value={viewType} onValueChange={onViewTypeChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Add Payment Method Button */}
        {onAddPaymentMethod && (
          <Button onClick={onAddPaymentMethod} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Method
          </Button>
        )}
      </DashboardBaseController>
    </div>
  );
};
