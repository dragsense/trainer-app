// React & Hooks
import { useState } from "react";

// External libraries
import { Filter, XIcon } from "lucide-react";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom UI Components
import { DatePicker } from "@/components/shared-ui/date-picker";
import { DateRange } from "react-day-picker";

interface ISessionFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value?: any) => void;
  onClearFilters: () => void;
}

export function SessionFilters({
  filters,
  onFilterChange,
  onClearFilters
}: ISessionFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    if (!date) {
      onFilterChange('startDateAfter');
      return;
    }

    if (date instanceof Date) {
      onFilterChange('startDateAfter', date);
      onFilterChange('startDateBefore');
    } else if ("from" in date) {
      const { from: createdAfter, to: createdBefore } = date;

      if (createdAfter && createdBefore && createdAfter.getTime() !== createdBefore.getTime()) {
        onFilterChange('startDateAfter', createdAfter);
        onFilterChange('startDateBefore', createdBefore);

      } else if (createdAfter) {
        onFilterChange('startDateAfter', createdAfter);
        onFilterChange('startDateBefore');
      }
    }
  };

  const renderFilters = (
    <>
      <DatePicker
        placeholder="Start At"
        mode="range"
        value={filters.joined ? {
          from: filters.startDateAfter,
          to: filters.startDateBefore
        } : undefined}
        onSelect={handleDateSelect}
      />
    </>
  );

  return (
    <div className="flex-1 flex items-center gap-2 flex-wrap">
      <Input
        placeholder="Search trainers..."
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            collisionPadding={20}
            align="start"
            className="w-64 p-2"
          >
            <div className="flex flex-col gap-2">
              {renderFilters}
              {hasActiveFilters && (
                <Button variant="outline" onClick={onClearFilters} size="sm">
                  <XIcon className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop filters (always visible) */}
      <div className="hidden xl:flex items-center gap-2">
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