// React & Hooks
import { useState } from "react";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import SessionTable from "../table/session-table";
import SessionCalendar from "../calendar/session-calendar";

// Stores
import { TListHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface ISessionViewProps {
  storeKey: string;
}

export default function SessionView({ storeKey }: ISessionViewProps) {
  const [activeTab, setActiveTab] = useState("table");

  const listStoreKey = storeKey + "-list";
  const singleStoreKey = storeKey + "-single";

  const listStore = useRegisteredStore<TListHandlerStore<ISession>>(listStoreKey);
  const singleStore = useRegisteredStore<TSingleHandlerStore<ISession>>(singleStoreKey);

  if (!listStore) {
    return `List store "${listStoreKey}" not found. Did you forget to register it?`;
  }

  if (!singleStore) {
    return `Single store "${singleStoreKey}" not found. Did you forget to register it?`;
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value="table">Table View</TabsTrigger>
        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
      </TabsList>
      
      <TabsContent value="table" className="space-y-4">
        <SessionTable storeKey={storeKey} />
      </TabsContent>
      
      <TabsContent value="calendar" className="space-y-4">
        <SessionCalendar storeKey={storeKey} />
      </TabsContent>
    </Tabs>
  );
}
