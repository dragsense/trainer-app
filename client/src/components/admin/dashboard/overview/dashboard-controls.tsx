import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface IDashboardControlsProps {
  period: 'day' | 'week' | 'month' | 'year';
  setPeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
  customDate: string;
  setCustomDate: (date: string) => void;
}

export const DashboardControls: React.FC<IDashboardControlsProps> = ({
  period,
  setPeriod,
  customDate,
  setCustomDate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
      <div className="flex gap-2">
        <Select value={period} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setPeriod(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
        <DatePicker
          value={customDate ? new Date(customDate) : undefined}
          onSelect={(date) => setCustomDate(date ? date.toISOString().split('T')[0] : '')}
          placeholder="Custom date"
        />
      
      </div>
    </div>
  );
};
