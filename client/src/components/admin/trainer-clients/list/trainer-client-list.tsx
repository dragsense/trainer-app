// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import { Filter, Plus, Table, List } from "lucide-react";

// Types
import { ITrainerClient } from "@/@types/trainer-client.type";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TTable } from "@/components/table-ui/table";
import { List as TList } from "@/components/list-ui/list";
import { AppCard } from "@/components/layout-ui/app-card";
import { TrainerClientFilters } from "./trainer-client-filters";

// Local
import { columns, listItem } from "./trainer-client-item-views";

// Stores
import { TListHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface ITrainerClientListProps {
  storeKey: string;
  store: TListHandlerStore<ITrainerClient, any>;
}

export default function TrainerClientList({
  storeKey,
  store
}: ITrainerClientListProps) {

  const singleStoreKey = storeKey + "-single";

  if (!store) {
    return <div>List store "{storeKey}" not found. Did you forget to register it?</div>;
  }


  const singleStore = useRegisteredStore<TSingleHandlerStore<ITrainerClient, any>>(singleStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const setListFilters = store(state => state.setFilters);
  const setAction = singleStore(state => state.setAction);


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
    setAction('createOrUpdate');
  };

  const handleEdit = (id: number) => {
    setAction('createOrUpdate', id);
  }

  const handleDelete = (id: number) => {
    setAction('delete', id);
  }

  const handleView = (id: number) => {
    setAction('view', id);
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


  const renderViewToggle = () => (
    <TabsList className="grid grid-cols-2 w-auto border-b border-gray-200">
      <TabsTrigger
        value="table"
        className="flex items-center gap-2 px-4 py-2 data-[state=active]:text-secondary data-[state=active]:font-semibold"
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </TabsTrigger>

      <TabsTrigger
        value="list"
        className="flex items-center gap-2 px-4 py-2 data-[state=active]:text-secondary data-[state=active]:font-semibold"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline">List</span>
      </TabsTrigger>
    </TabsList>
  );


  return (
    <Tabs value={viewType} onValueChange={(value) => setViewType(value as "table" | "list")}>


      <div className="flex justify-between items-start md:items-center gap-2 flex-wrap">
        <TrainerClientFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        {renderViewToggle()}
        <Button
          onClick={handleCreate}
        >
          <Plus /> <span className="hidden sm:inline capitalize">Add Trainer-Client Assignment</span>
        </Button>
      </div>



      <TabsContent value="table" className="mt-4">
        <AppCard><TTable<ITrainerClient>
          listStore={store}
          columns={tableColumns}
          emptyMessage="No trainer-client assignments found."
          showPagination={true}
        /></AppCard>
      </TabsContent>

      <TabsContent value="list" className="mt-4">
        <TList<ITrainerClient>
          listStore={store}
          emptyMessage="No trainer-client assignments found."
          showPagination={true}
          renderItem={listItemComponent}
        />
      </TabsContent>

    </Tabs>
  );
}