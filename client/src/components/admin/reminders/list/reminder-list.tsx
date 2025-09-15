// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import { Filter, Plus, Table, List } from "lucide-react";

// Types
import { IReminder } from "@/@types/reminder.type";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";
import { AppCard } from "@/components/layout-ui/app-card";
import { ReminderFilters } from "./reminder-filters";

// Local
import { columns, listItem } from "./reminder-item-views";

// Stores
import { TListHandlerStore, TSingleHandlerStore } from "@/stores";

interface IReminderListProps {
  storeKey: string;
  store: TListHandlerStore<IReminder, any>;
}

export default function ReminderList({
  storeKey,
  store
}: IReminderListProps) {

  const listStoreKey = storeKey + "-list";

  if (!store) {
    return <div>List store "{listStoreKey}" not found. Did you forget to register it?</div>;
  }

  const setListFilters = store.getState().setFilters;

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [viewType, setViewType] = useState<"table" | "list">("table");

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
  };

  // Flatten nested filter objects for backend
  const flattenFilters = (filters: Record<string, any>) => {
    const flattened: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        // Handle nested objects like date ranges
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (nestedValue !== undefined && nestedValue !== null && nestedValue !== '') {
            flattened[nestedKey] = nestedValue;
          }
        });
      } else if (value !== undefined && value !== null && value !== '') {
        flattened[key] = value;
      }
    });
    
    return flattened;
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    timer = setTimeout(() => {
      const flattenedFilters = flattenFilters(filters);
      setListFilters(flattenedFilters);
    }, 500);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [filters, setListFilters]);

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleCreate = () => {
    // TODO: Implement create action
  };

  const handleEdit = (id: number) => {
    // TODO: Implement edit action
  }

  const handleDelete = (id: number) => {
    // TODO: Implement delete action
  }

  const handleView = (id: number) => {
    // TODO: Implement view action
  }

  const tableColumns = columns({
    handleEdit,
    handleView,
    handleDelete
  });

  const listItemComponent = listItem({
    handleEdit,
    handleView,
    handleDelete
  });

  return (
    <AppCard
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Reminders</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleCreate} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Reminder
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <ReminderFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* View Toggle and Content */}
        <Tabs value={viewType} onValueChange={(value) => setViewType(value as "table" | "list")}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Table
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="mt-4">
            <TTable<IReminder>
              listStore={store}
              columns={tableColumns}
              emptyMessage="No reminders found."
              showPagination={true}
            />
          </TabsContent>

          <TabsContent value="list" className="mt-4">
            <TList<IReminder>
              listStore={store}
              emptyMessage="No reminders found."
              showPagination={true}
              renderItem={listItemComponent}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppCard>
  );
}