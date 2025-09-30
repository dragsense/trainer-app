// React & Hooks
import { useState } from "react";

// External libraries
import { Filter, XIcon } from "lucide-react";

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
import { EBillingStatus } from "@shared/enums/billing.enum";

interface IBillingFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value?: any) => void;
  onClearFilters: () => void;
}

export function BillingFilters({
  filters,
  onFilterChange,
  onClearFilters
}: IBillingFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined, dateType: 'issue' | 'due' | 'paid') => {
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
          <SelectItem value={EBillingStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={EBillingStatus.PAID}>Paid</SelectItem>
          <SelectItem value={EBillingStatus.OVERDUE}>Overdue</SelectItem>
          <SelectItem value={EBillingStatus.FAILED}>Failed</SelectItem>
        </SelectContent>
      </Select>

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
          <SelectItem value="SESSION">Session</SelectItem>
          <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
          <SelectItem value="PACKAGE">Package</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>



      {/* Date Range Filters */}
      <DatePicker
        placeholder="Issue Date"
        mode="range"
        value={filters.issueDate ? { 
          from: filters.issueDate.issueDateFrom, 
          to: filters.issueDate.issueDateTo 
        } : undefined}
        onSelect={(date) => handleDateSelect(date, 'issue')}
      />

      <DatePicker
        placeholder="Due Date"
        mode="range"
        value={filters.dueDate ? { 
          from: filters.dueDate.dueDateFrom, 
          to: filters.dueDate.dueDateTo 
        } : undefined}
        onSelect={(date) => handleDateSelect(date, 'due')}
      />
    </>
  );

  return (
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search billings..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="flex-1"
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