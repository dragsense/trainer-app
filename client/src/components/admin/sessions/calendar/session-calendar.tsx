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

  if (!listStore) {
    return `List store "${listStoreKey}" not found. Did you forget to register it?`;
  }

  if (!singleStore) {
    return `Single store "${singleStoreKey}" not found. Did you forget to register it?`;
  }

  const setAction = singleStore(state => state.setAction);

  const { response: sessions, isLoading, error } = listStore(useShallow(state => ({
    response: state.response,
    isLoading: state.isLoading,
    error: state.error,

  })));

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    if (!sessions) return {};

    return sessions.reduce((acc: Record<string, ISession[]>, session: ISession) => {
      const dateKey = format(new Date(session.dateTime), 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(session);
      return acc;
    }, {} as Record<string, ISession[]>);
  }, [sessions]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreate = () => {
    setAction('createOrUpdate');
  };

   const handleView = (id: number) => {
    setAction('view', id);
  };


  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'ONE_ON_ONE':
        return 'bg-blue-100 text-blue-800';
      case 'GROUP':
        return 'bg-green-100 text-green-800';
      case 'CONSULTATION':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

  if (error) {
    return <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>
  }


  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 border-r last:border-r-0">
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
                className={`min-h-[140px] md:min-h-[160px] p-2 border-r border-b last:border-r-0 ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600' : ''
                  }`}>
                  {format(day, 'd')}
                  {isToday && ' (Today)'}
                </div>

                <div className="space-y-1">
                  {daySessions.slice(0, 2).map((session: ISession) => (
                    <div
                      key={session.id}
                      onClick={() => handleView(session.id)}
                      className="cursor-pointer"
                    >
                      <Badge
                        variant="secondary"
                        className={`w-full text-xs p-2 justify-start hover:opacity-80 ${getSessionTypeColor(session.type)}`}
                      >
                        <div className="w-full space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{format(new Date(session.dateTime), 'HH:mm')}</span>
                            <span className="text-xs">{session.currency} {session.pricePerClient}</span>
                          </div>
                          <div className="truncate font-medium">{session.title}</div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="truncate">
                              {session.clients?.length}
                            </span>
                            <span>{session.duration}m</span>
                          </div>
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">Session Types:</span>
        <Badge className="bg-blue-100 text-blue-800">One-on-One</Badge>
        <Badge className="bg-green-100 text-green-800">Group</Badge>
        <Badge className="bg-purple-100 text-purple-800">Consultation</Badge>
      </div>

    </div>
  );
}
