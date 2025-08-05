// React & Hooks
import { useState } from "react";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import SessionTable from "../table/session-table";
import SessionCalendar from "../calendar/session-calendar";

interface ISessionViewProps {
  storeKey: string;
}

export default function SessionView({ storeKey }: ISessionViewProps) {
  const [activeTab, setActiveTab] = useState("table");


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
