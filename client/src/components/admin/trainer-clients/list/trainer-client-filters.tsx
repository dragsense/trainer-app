// React & Hooks
import { useState } from "react";

// External libraries
import { Filter, XIcon, User, Users, Calendar, Target, Heart } from "lucide-react";

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

interface ITrainerClientFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value?: any) => void;
  onClearFilters: () => void;
}

export function TrainerClientFilters({
  filters,
  onFilterChange,
  onClearFilters
}: ITrainerClientFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    if (!date) {
      onFilterChange('assignedDate');
      return;
    }

    if (date instanceof Date) {
      onFilterChange('assignedDate', { 
        assignedDateFrom: date, 
        assignedDateTo: undefined 
      });
    } else if ("from" in date) {
      const { from, to } = date;
      if (from && to && from.getTime() !== to.getTime()) {
        onFilterChange('assignedDate', { 
          assignedDateFrom: from, 
          assignedDateTo: to 
        });
      } else if (from) {
        onFilterChange('assignedDate', { 
          assignedDateFrom: from, 
          assignedDateTo: undefined 
        });
      }
    }
  };

  const renderFilters = (
    <>
      {/* Trainer ID Filter */}
      <Input
        placeholder="Trainer ID"
        type="number"
        value={filters.trainerId || ""}
        onChange={(e) => onFilterChange("trainerId", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

      {/* Client ID Filter */}
      <Input
        placeholder="Client ID"
        type="number"
        value={filters.clientId || ""}
        onChange={(e) => onFilterChange("clientId", e.target.value ? Number(e.target.value) : undefined)}
        className="w-[120px]"
      />

    

      {/* Assignment Date Range Filter */}
      <DatePicker
        placeholder="Assignment Date"
        mode="range"
        value={filters.assignedDate ? { 
          from: filters.assignedDate.assignedDateFrom, 
          to: filters.assignedDate.assignedDateTo 
        } : undefined}
        onSelect={handleDateSelect}
      />
    </>
  );

  return (
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search assignments..."
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