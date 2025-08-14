// React & Hooks
import { useMemo, useState } from "react";
import { useShallow } from 'zustand/shallow';

// External libraries
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Stores
import { TListHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface ISessionCalendarProps {
  storeKey: string;
}

export default function SessionCalendar({ storeKey }: ISessionCalendarProps) {
  const listStoreKey = storeKey + "-list";
  const singleStoreKey = storeKey + "-single";

  const listStore = useRegisteredStore<TListHandlerStore<ISession>>(listStoreKey);
  const singleStore = useRegisteredStore<TSingleHandlerStore<ISession>>(singleStoreKey);

  const [currentDate, setCurrentDate] = useState(new Date());

  if (!listStore) return `List store "${listStoreKey}" not found.`;
  if (!singleStore) return `Single store "${singleStoreKey}" not found.`;

  const setAction = singleStore(state => state.setAction);
  const { response: sessions, isLoading, error } = listStore(useShallow(state => ({
    response: state.response,
    isLoading: state.isLoading,
    error: state.error,
  })));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const sessionsByDate = useMemo(() => {
    if (!sessions) return {};
    return sessions.reduce((acc: Record<string, ISession[]>, session: ISession) => {
      const dateKey = format(new Date(session.dateTime), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(session);
      return acc;
    }, {});
  }, [sessions]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const handleCreate = () => setAction('createOrUpdate');
  const handleView = (id: number) => setAction('view', id);

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE': return 'bg-blue-100 text-blue-800';
      case 'GROUP': return 'bg-green-100 text-green-800';
      case 'CONSULTATION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>;
  }

  return (
    <div className="space-y-4 relative">
      {/* Calendar Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg md:text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Desktop Add Session */}
        <Button onClick={handleCreate} className="hidden md:flex">
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b text-xs md:text-sm">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 md:p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const daySessions = sessionsByDate[dateKey] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] md:min-h-[140px] p-1 md:p-2 border-r border-b last:border-r-0 
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''} 
                  ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-xs md:text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                  {format(day, 'd')}
                  {isToday && <span className="hidden md:inline"> (Today)</span>}
                </div>

                {/* Desktop - show session details */}
                <div className="hidden md:block space-y-1">
                  {daySessions.slice(0, 2).map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleView(session.id)}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant="secondary"
                        className={`w-full text-xs p-1.5 justify-start hover:opacity-80 ${getSessionTypeColor(session.type)}`}
                      >
                        <div className="w-full space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{format(new Date(session.dateTime), 'HH:mm')}</span>
                            <span className="text-xs">{session.currency} {session.pricePerClient}</span>
                          </div>
                          <div className="truncate font-medium">{session.title}</div>
                        </div>
                      </Badge>
                    </div>
                  ))}
                  {daySessions.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{daySessions.length - 2} more
                    </div>
                  )}
                </div>

                {/* Mobile - show only count */}
                <div className="flex md:hidden flex-wrap gap-1">
                  {daySessions.length > 0 && (
                    <span
                      className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={() => handleView(daySessions[0].id)}
                    >
                      {daySessions.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend (Desktop only) */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        <span className="font-medium">Session Types:</span>
        <Badge className="bg-blue-100 text-blue-800">One-on-One</Badge>
        <Badge className="bg-green-100 text-green-800">Group</Badge>
        <Badge className="bg-purple-100 text-purple-800">Consultation</Badge>
      </div>

      {/* Floating Add Button for Mobile */}
      <Button
        onClick={handleCreate}
        className="md:hidden fixed bottom-16 right-4 rounded-full p-4 shadow-lg"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}

