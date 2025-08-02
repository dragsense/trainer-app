import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { DashboardBaseController } from '../../shared';

interface IRevenueControllerProps {
  period: 'day' | 'week' | 'month' | 'year';
  chartType: 'line' | 'area' | 'bar';
  customDate: string;
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year') => void;
  onChartTypeChange: (chartType: 'line' | 'area' | 'bar') => void;
  onCustomDateChange: (date: string) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const RevenueController: React.FC<IRevenueControllerProps> = ({
  period,
  chartType,
  customDate,
  onPeriodChange,
  onChartTypeChange,
  onCustomDateChange,
  onRefresh,
  onExport
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <DollarSign className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">Track revenue trends and performance</p>
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
        {/* Chart Type Selector - specific to revenue */}
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
          </SelectContent>
        </Select>
        
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
        
        <DatePicker
          value={customDate ? new Date(customDate) : undefined}
          onSelect={(date) => onCustomDateChange(date ? date.toISOString().split('T')[0] : '')}
          placeholder="Custom date"
        />
        
        <Button onClick={onRefresh} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        <Button onClick={onExport} size="sm" variant="outline">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
