// React & Hooks
import { format } from "date-fns";
import { Calendar, Clock, DollarSign, MapPin, Users, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

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
      className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/30"
      onClick={() => handleView(session.id)}
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="font-semibold text-lg md:text-xl mb-2 sm:mb-0 group-hover:text-primary transition-colors">
                {session.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {session.type}
                </Badge>
                <Badge className={
                  session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }>
                  {session.status}
                </Badge>
              </div>
            </div>

            {/* Trainer and Clients Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Trainer Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={session.trainer?.profile?.avatar} />
                  <AvatarFallback className="text-sm font-semibold">
                    {session.trainer?.profile?.firstName?.[0]}{session.trainer?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {session.trainer?.profile?.firstName} {session.trainer?.profile?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">Trainer</p>
                </div>
              </div>

              {/* Clients Info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{session.clients?.length || 0} clients</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.clients?.map(c => `${c.profile?.firstName} ${c.profile?.lastName}`).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{format(new Date(session.dateTime), "MMM dd")}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{format(new Date(session.dateTime), "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{session.duration} min</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/20">
                <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>${(session.pricePerClient / 100).toFixed(2)}</span>
              </div>
            </div>

            {session.location && (
              <div className="flex items-center gap-2 mt-3 p-2 rounded-md bg-muted/20">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground truncate">{session.location}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
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
