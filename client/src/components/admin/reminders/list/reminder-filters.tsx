// React & Hooks
import { useState } from "react";

// External libraries
import { Filter, XIcon, Calendar, User, Bell, Target, Clock } from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom UI Components
import { DatePicker } from "@/components/shared-ui/date-picker";
import { DateRange } from "react-day-picker";

// Types
import { EReminderType, EReminderStatus, EReminderFrequency } from "@shared/enums/reminder.enum";

interface IReminderFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value?: any) => void;
  onClearFilters: () => void;
}

export function ReminderFilters({
  filters,
  onFilterChange,
  onClearFilters
}: IReminderFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined, dateType: 'scheduled' | 'start') => {
    if (!date) {
      onFilterChange(dateType + 'Date');
      return;
    }

    if (date instanceof Date) {
      onFilterChange(dateType + 'Date', { 
        [dateType + 'DateFrom']: date, 
        [dateType + 'DateTo']: undefined 
      });
    } else if ("from" in date) {
      const { from, to } = date;
      if (from && to && from.getTime() !== to.getTime()) {
        onFilterChange(dateType + 'Date', { 
          [dateType + 'DateFrom']: from, 
          [dateType + 'DateTo']: to 
        });
      } else if (from) {
        onFilterChange(dateType + 'Date', { 
          [dateType + 'DateFrom']: from, 
          [dateType + 'DateTo']: undefined 
        });
      }
    }
  };

  const renderFilters = (
    <>
      {/* Type Filter */}
      <Select
        value={filters.type || "all"}
        onValueChange={(value) => onFilterChange("type", value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value={EReminderType.SESSION}>Session</SelectItem>
          <SelectItem value={EReminderType.PAYMENT}>Payment</SelectItem>
          <SelectItem value={EReminderType.GENERAL}>General</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => onFilterChange("status", value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={EReminderStatus.SCHEDULED}>Scheduled</SelectItem>
          <SelectItem value={EReminderStatus.SENT}>Sent</SelectItem>
          <SelectItem value={EReminderStatus.FAILED}>Failed</SelectItem>
          <SelectItem value={EReminderStatus.CANCELLED}>Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Frequency Filter */}
      <Select
        value={filters.frequency || "all"}
        onValueChange={(value) => onFilterChange("frequency", value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Frequencies</SelectItem>
          <SelectItem value={EReminderFrequency.ONCE}>Once</SelectItem>
          <SelectItem value={EReminderFrequency.DAILY}>Daily</SelectItem>
          <SelectItem value={EReminderFrequency.WEEKLY}>Weekly</SelectItem>
          <SelectItem value={EReminderFrequency.MONTHLY}>Monthly</SelectItem>
        </SelectContent>
      </Select>

      {/* Delivery Method Filter */}
      <Select
        value={filters.deliveryMethod || "all"}
        onValueChange={(value) => onFilterChange("deliveryMethod", value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Delivery" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Methods</SelectItem>
          <SelectItem value="EMAIL">Email</SelectItem>
          <SelectItem value="SMS">SMS</SelectItem>
          <SelectItem value="PUSH">Push</SelectItem>
          <SelectItem value="IN_APP">In-App</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority || "all"}
        onValueChange={(value) => onFilterChange("priority", value === "all" ? undefined : (value ? Number(value) : undefined))}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="1">High (1)</SelectItem>
          <SelectItem value="2">Medium (2)</SelectItem>
          <SelectItem value="3">Low (3)</SelectItem>
        </SelectContent>
      </Select>

      {/* User ID Filters */}
      <Input
        placeholder="Creator ID"
        type="number"
        value={filters.creatorId || ""}
        onChange={(e) => onFilterChange("creatorId", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

      <Input
        placeholder="Recipient ID"
        type="number"
        value={filters.recipientId || ""}
        onChange={(e) => onFilterChange("recipientId", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

      {/* Email Filters */}
      <Input
        placeholder="Creator Email"
        value={filters.creatorEmail || ""}
        onChange={(e) => onFilterChange("creatorEmail", e.target.value || undefined)}
        className="w-[160px]"
      />

      <Input
        placeholder="Recipient Email"
        value={filters.recipientEmail || ""}
        onChange={(e) => onFilterChange("recipientEmail", e.target.value || undefined)}
        className="w-[160px]"
      />

      {/* Session/Payment ID Filters */}
      <Input
        placeholder="Session ID"
        type="number"
        value={filters.sessionId || ""}
        onChange={(e) => onFilterChange("sessionId", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

      <Input
        placeholder="Payment ID"
        type="number"
        value={filters.paymentId || ""}
        onChange={(e) => onFilterChange("paymentId", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

      {/* Title Filter */}
      <Input
        placeholder="Title"
        value={filters.title || ""}
        onChange={(e) => onFilterChange("title", e.target.value || undefined)}
        className="w-[160px]"
      />

      {/* Message Filter */}
      <Input
        placeholder="Message"
        value={filters.message || ""}
        onChange={(e) => onFilterChange("message", e.target.value || undefined)}
        className="w-[160px]"
      />

      {/* Time of Day Filter */}
      <Input
        placeholder="Time (HH:mm)"
        value={filters.timeOfDay || ""}
        onChange={(e) => onFilterChange("timeOfDay", e.target.value || undefined)}
        className="w-[120px]"
      />

      {/* Interval Minutes Filter */}
      <Input
        placeholder="Interval (min)"
        type="number"
        value={filters.intervalMinutes || ""}
        onChange={(e) => onFilterChange("intervalMinutes", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

      {/* Date Range Filters */}
      <DatePicker
        placeholder="Scheduled Date"
        mode="range"
        value={filters.scheduledDate ? { 
          from: filters.scheduledDate.scheduledDateFrom, 
          to: filters.scheduledDate.scheduledDateTo 
        } : undefined}
        onSelect={(date) => handleDateSelect(date, 'scheduled')}
      />

      <DatePicker
        placeholder="Start Date"
        mode="range"
        value={filters.startDate ? { 
          from: filters.startDate.startDateFrom, 
          to: filters.startDate.startDateTo 
        } : undefined}
        onSelect={(date) => handleDateSelect(date, 'start')}
      />
    </>
  );

  return (
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search reminders..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
         
        />
        
        {/* Mobile filters (dropdown) */}
        <div className="xl:hidden flex items-center gap-2">
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs">!</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              collisionPadding={20}
              align="start"
              className="w-80 p-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex flex-col gap-3">
                <div className="font-medium text-sm">Filter Options</div>
                {renderFilters}
                {hasActiveFilters && (
                  <Button variant="outline" onClick={onClearFilters} size="sm" className="mt-2">
                    <XIcon className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Desktop filters (always visible) */}
        <div className="hidden xl:flex items-center gap-2 flex-wrap">
          {renderFilters}
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="hidden lg:flex">
            <XIcon className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    
  );
}