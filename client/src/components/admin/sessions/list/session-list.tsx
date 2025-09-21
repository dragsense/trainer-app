// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import { Plus, Table, List } from "lucide-react";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom UI Components
import { Table as TableComponent } from "@/components/table-ui/table";
import { List as ListComponent } from "@/components/list-ui/list";
import { AppCard } from "@/components/layout-ui/app-card";
import { SessionFilters } from "./session-filters";

// Local
import { itemViews } from "./session-item-views";

// Stores
import { TListHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";



interface ISessionListProps {
  storeKey: string;
  store: TListHandlerStore<ISession, any>;
}

export type ViewType = "table" | "list";

export default function SessionList({
  storeKey,
  store
}: ISessionListProps) {

  const listStoreKey = storeKey + "-list";
  const singelStoreKey = storeKey + "-single";

  if (!store) {
    return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<ISession, any>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const setAction = singleStore((state: any) => state.setAction);
  const setListFilters = store((state: any) => state.setFilters);

  const [currentView, setCurrentView] = useState<ViewType>("table");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value?: any) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setFilters(newFilters);
  };

  useEffect(() => {
    let timer = null;

    timer = setTimeout(() => {
      setListFilters(filters);
    }, 500);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [filters]);

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

  const { columns, listItem } = itemViews({
    handleEdit,
    handleDelete,
    handleView
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
        <span className="hidden sm:inline">Cards</span>
      </TabsTrigger>
    </TabsList>
  );

  return (

    <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "table" | "list")}>


        <div className="flex justify-between items-start md:items-center gap-2 flex-wrap">
          <SessionFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          {renderViewToggle()}
          <Button
            onClick={handleCreate}
          >
            <Plus /> <span className="hidden sm:inline capitalize">Add Session</span>
          </Button>
        </div>
      

      <TabsContent value="table" className="space-y-4">
        <AppCard><TableComponent<ISession>
          listStore={store}
          columns={columns}
          emptyMessage="No sessions found."
          showPagination
        />
        </AppCard>
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        <ListComponent<ISession>
          listStore={store}
          renderItem={listItem}
          emptyMessage="No sessions found."
          showPagination
        />
      </TabsContent>
    </Tabs>

  );
}