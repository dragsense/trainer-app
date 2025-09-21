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

interface IInvoiceFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value?: any) => void;
  onClearFilters: () => void;
}

export function InvoiceFilters({
  filters,
  onFilterChange,
  onClearFilters
}: IInvoiceFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined, dateType: 'created' | 'due' | 'paid') => {
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
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="void">Void</SelectItem>
          <SelectItem value="uncollectible">Uncollectible</SelectItem>
        </SelectContent>
      </Select>

      {/* Currency Filter */}
      <Select
        value={filters.currency || "all"}
        onValueChange={(value) => onFilterChange("currency", value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="usd">USD</SelectItem>
          <SelectItem value="eur">EUR</SelectItem>
          <SelectItem value="gbp">GBP</SelectItem>
          <SelectItem value="cad">CAD</SelectItem>
        </SelectContent>
      </Select>

      {/* Amount Range */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Min Amount"
          type="number"
          value={filters.minAmount || ""}
          onChange={(e) => onFilterChange("minAmount", e.target.value ? Number(e.target.value) : undefined)}
          className="w-[120px]"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          placeholder="Max Amount"
          type="number"
          value={filters.maxAmount || ""}
          onChange={(e) => onFilterChange("maxAmount", e.target.value ? Number(e.target.value) : undefined)}
          className="w-[120px]"
        />
      </div>

      {/* Customer ID Filter */}
      <Input
        placeholder="Customer ID"
        value={filters.customerId || ""}
        onChange={(e) => onFilterChange("customerId", e.target.value || undefined)}
        className="w-[140px]"
      />

      {/* Invoice Number Filter */}
      <Input
        placeholder="Invoice #"
        value={filters.invoiceNumber || ""}
        onChange={(e) => onFilterChange("invoiceNumber", e.target.value || undefined)}
        className="w-[140px]"
      />

      {/* Date Range Filters */}
      <DatePicker
        placeholder="Created Date"
        mode="range"
        value={filters.createdDate ? { 
          from: filters.createdDate.createdDateFrom, 
          to: filters.createdDate.createdDateTo 
        } : undefined}
        onSelect={(date) => handleDateSelect(date, 'created')}
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

      <DatePicker
        placeholder="Paid Date"
        mode="range"
        value={filters.paidDate ? { 
          from: filters.paidDate.paidDateFrom, 
          to: filters.paidDate.paidDateTo 
        } : undefined}
        onSelect={(date) => handleDateSelect(date, 'paid')}
      />
    </>
  );

  return (
    <div className="flex flex-1 justify-between items-center gap-2">
      <div className="flex-1 flex items-center gap-2">
        <Input
          placeholder="Search invoices..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="max-w-sm"
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
    </div>
  );
}
