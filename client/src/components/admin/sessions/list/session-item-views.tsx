// React & Hooks
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, MapPin, Users, MoreHorizontal, Eye, Edit, Trash2, Timer, CalendarDays, Clock3 } from "lucide-react";

// Types
import { ISession } from "@/@types/session.type";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom UI Components
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { ColumnDef } from "@tanstack/react-table";

interface ItemViewHandlers {
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  handleView: (id: number) => void;
}

const SessionActions = ({
  session,
  handleEdit,
  handleDelete,
  handleView
}: {
  session: ISession;
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (id: number) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView?.(session.id); }}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit?.(session.id); }}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); handleDelete?.(session.id); }}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function itemViews({ handleEdit, handleDelete, handleView }: ItemViewHandlers) {
  
  // Table Columns
  const columns: ColumnDef<ISession>[] = [
    {
      accessorKey: "title",
      header: "Session",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium">{session.title}</span>
              <span className="text-sm text-muted-foreground">{session.type}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "trainer",
      header: "Trainer",
      cell: ({ row }) => {
        const session = row.original;
        const trainer = session.trainer;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={trainer?.profile?.avatar} />
              <AvatarFallback>
                {trainer?.profile?.firstName?.[0]}{trainer?.profile?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {trainer?.profile?.firstName} {trainer?.profile?.lastName}
              </span>
              <span className="text-xs text-muted-foreground">{trainer?.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "clients",
      header: "Clients",
      cell: ({ row }) => {
        const session = row.original;
        const clients = session.clients || [];
        return (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{clients.length}</span>
            {clients.length > 0 && (
              <div className="flex -space-x-1">
                {clients.slice(0, 3).map((client, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={client?.profile?.avatar} />
                    <AvatarFallback className="text-xs">
                      {client?.profile?.firstName?.[0]}{client?.profile?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {clients.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs">+{clients.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dateTime",
      header: "Date & Time",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{format(new Date(session.dateTime), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{format(new Date(session.dateTime), "h:mm a")}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{session.duration} min</span>
          </div>
        );
      },
    },
    {
      accessorKey: "pricePerClient",
      header: "Price",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">${(session.pricePerClient / 100).toFixed(2)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const session = row.original;
        const getStatusColor = (status: string) => {
          switch (status) {
            case 'SCHEDULED':
              return 'bg-blue-100 text-blue-800';
            case 'COMPLETED':
              return 'bg-green-100 text-green-800';
            case 'CANCELLED':
              return 'bg-red-100 text-red-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        return (
          <Badge className={getStatusColor(session.status)}>
            {session.status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const session = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleView(session.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(session.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(session.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // List Item Component
  const listItem = (session: ISession) => (
    <AppCard
      key={session.id}
      className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/20"
      onClick={() => handleView(session.id)}
    >
      <div className="p-3">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header with Title and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                  {session.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {session.type.replace('_', ' ')} Session
                </p>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {session.type.replace('_', ' ')}
                </Badge>
                <Badge className={
                  session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  session.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' :
                  session.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }>
                  {session.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Main Session Info - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Date & Time */}
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                <CalendarDays className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-semibold text-blue-800">
                    {format(new Date(session.dateTime), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {format(new Date(session.dateTime), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Duration & Price */}
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                <Timer className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Duration & Price</p>
                  <p className="text-sm font-semibold text-green-800">{session.duration} minutes</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    ${(session.pricePerClient / 100).toFixed(2)} per client
                  </p>
                </div>
              </div>

              {/* Trainer & Clients */}
              <div className="flex items-center gap-2 p-2 rounded bg-purple-50 border border-purple-200 sm:col-span-2 lg:col-span-1">
                <Users className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="text-sm font-semibold text-purple-800">
                    {session.clients?.length || 0} clients
                  </p>
                  <p className="text-xs text-purple-600 truncate">
                    Trainer: {session.trainer?.profile?.firstName} {session.trainer?.profile?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Location and Description */}
            {(session.location || session.description) && (
              <div className="space-y-2">
                {session.location && (
                  <div className="flex items-center gap-2 p-2 rounded bg-muted/20 border">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">{session.location}</span>
                  </div>
                )}
                {session.description && (
                  <div className="p-2 rounded bg-muted/20 border">
                    <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 self-start">
            <SessionActions
              session={session}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleView={handleView}
            />
          </div>
        </div>
      </div>
    </AppCard>
  );

  return { columns, listItem };
}
