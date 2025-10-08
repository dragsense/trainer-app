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
import { IUser } from "@shared/interfaces/user.interface";
import { TListHandlerStore } from "@/stores/list/list-handler-store";
import { useInput } from "@/hooks/use-input";
import { TFieldConfigObject } from "@/@types/form/field-config.type";

interface IUserFiltersProps {
  store: TListHandlerStore<IUser, any>;
}

export function UserFilters<TUserListData>({
  store,
}: IUserFiltersProps) {


  const filteredFields = store.getState().filteredFields;
  const filters = store(state => state.filters);
  const setFilters = store.getState().setFilters;

  console.log(filteredFields);

  const inputs = useInput<TUserListData>({
    fields: filteredFields as TFieldConfigObject<TUserListData>,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = Object.keys(store.getState().filters).length > 0;

  const handleDateSelect = (date: Date | DateRange | undefined) => {
    const filters = store.getState().filters;

    if (!date) {
      setFilters({ ...filters, joined: undefined });
      return;
    }

    if (date instanceof Date) {
      setFilters({ ...filters, joined: { createdAfter: date, createdBefore: undefined } });
    } else if ("from" in date) {
      const { from: createdAfter, to: createdBefore } = date;

      if (createdAfter && createdBefore && createdAfter.getTime() !== createdBefore.getTime()) {
        setFilters({ ...filters, joined: { createdAfter, createdBefore } });
      } else if (createdAfter) {
        setFilters({ ...filters, joined: { createdAfter, createdBefore: undefined } });
      }
    }
  };

  const renderFilters = (
    <>
      <DatePicker
        placeholder="Joined"
        mode="range"
        value={filters.joined ? {
          from: filters.joined.createdAfter,
          to: filters.joined.createdBefore
        } : undefined}
        onSelect={handleDateSelect}
      />
    </>
  );

  return (
    <div className="flex-1 flex items-center gap-2 flex-wrap">
      {inputs.search as any}

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
                <Button variant="outline" onClick={() => setFilters({})} size="sm">
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
        <Button variant="outline" onClick={() => setFilters({})} className="hidden lg:flex">
          <XIcon className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>

  );
}