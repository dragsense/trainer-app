import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { DashboardBaseController } from '../shared';

interface IBillingControllerProps {
  period: 'day' | 'week' | 'month' | 'year';
  customDate: string;
  chartType: 'line' | 'area' | 'bar';
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  onCustomDateChange: (date: string) => void;
  onChartTypeChange: (chartType: 'line' | 'area' | 'bar') => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const BillingController: React.FC<IBillingControllerProps> = ({
  period,
  customDate,
  chartType,
  onPeriodChange,
  onCustomDateChange,
  onChartTypeChange,
  onRefresh,
  onExport
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CreditCard className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Billing Analytics</h3>
          <p className="text-sm text-muted-foreground">Monitor billing performance and trends</p>
        </div>
      </div>
      
      <DashboardBaseController
        period={period}
        customDate={customDate}
        onPeriodChange={onPeriodChange}
        onCustomDateChange={onCustomDateChange}
        onRefresh={onRefresh}
        onExport={onExport}
        showExport={true}
        showRefresh={true}
      >
        {/* Chart Type Selector - specific to billing */}
        <Select value={chartType} onValueChange={onChartTypeChange}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
          </SelectContent>
        </Select>
      </DashboardBaseController>
    </div>
  );
};
