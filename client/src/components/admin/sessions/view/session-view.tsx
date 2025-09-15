// React & Hooks
import { useState } from "react";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import SessionList from "../list/session-list";
import SessionCalendar from "../calendar/session-calendar";

// Stores
import { TListHandlerStore } from "@/stores";

interface ISessionViewProps {
  storeKey: string;
  store: TListHandlerStore<ISession, any>;
}

export default function SessionView({ storeKey, store }: ISessionViewProps) {
  const [activeTab, setActiveTab] = useState("table");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value="table">Table View</TabsTrigger>
        <TabsTrigger value="calendar">Calendar View</TabsTrigger>
      </TabsList>
      
      <TabsContent value="table" className="space-y-4">
        <SessionList storeKey={storeKey} store={store} />
      </TabsContent>
      
      <TabsContent value="calendar" className="space-y-4">
        <SessionCalendar storeKey={storeKey} />
      </TabsContent>
    </Tabs>
  );
}
