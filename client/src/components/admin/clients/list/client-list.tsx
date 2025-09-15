// React & Hooks
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// External libraries
import { Filter, Plus, XIcon } from "lucide-react";

// Types
import { IUser } from "@/@types/user.type";

// UI Components
import { Button } from "@/components/ui/button";


// Custom UI Components
import { Table } from "@/components/table-ui/table";
import { AppCard } from "@/components/layout-ui/app-card";
import { ClientFilters } from "./client-filters";

// Local
import { columns } from "./client-columns";

// Stores
import { TListHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Config
import { ADMIN_ROUTES } from "@/config/routes.config";

// Utility
import { buildRoutePath } from "@/lib/utils";


interface IClientTableProps {
  storeKey: string;
}

export default function ClientTable({
  storeKey,
}: IClientTableProps) {

  const listStoreKey = storeKey + "-list";
  const singelStoreKey = storeKey + "-single";

  const listStore = useRegisteredStore<TListHandlerStore<IUser>>(listStoreKey);

  if (!listStore) {
    return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
  }

  const singleStore = useRegisteredStore<TSingleHandlerStore<IUser>>(singelStoreKey);

  if (!singleStore) {
    return `Single store "${singleStore}" not found. Did you forget to register it?`;
  }

  const setAction = singleStore(state => state.setAction);
  const setListFilters = listStore(state => state.setFilters);
  const navigate = useNavigate();


  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (key: string, value: any) => {
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

  const handleViewSessions = (id: number) => {
    navigate(buildRoutePath(ADMIN_ROUTES.TRAINER_CLIENTS, undefined, { clientId: id }));
  }


  const handleAssign = (clientId: number) => {
    setAction('assignTrainer', clientId);
  }


  const tableColumns = columns({
    handleEdit,
    handleDelete,
    handleView,
    handleViewSessions,
    handleAssign
  }
  );



  return (
    <AppCard
      header={
        <div className="flex flex-col xl:flex-row xl:items-center gap-2">
          <h3 className="text-bold">Clients</h3>

          <div className="flex flex-1 justify-between items-center gap-2">
            <ClientFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
            <Button
              onClick={handleCreate}
            >
              <Plus /> <span className="hidden sm:inline capitalize">Add Client</span>
            </Button>
          </div>
        </div>
      }>
      <Table<IUser>
        listStore={listStore}
        columns={tableColumns}

        emptyMessage="No clients found."
        showPagination
      />
    </AppCard>
  );
}
