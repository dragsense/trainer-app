// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, Clock, Bell, User, Mail, Target, CalendarDays, Clock3, Timer, Send } from "lucide-react";
import { format } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppCard } from "@/components/layout-ui/app-card";

// Types
import { IReminder } from "@shared/interfaces/reminder.interface";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED':
      return 'default';
    case 'SENT':
      return 'outline';
    case 'PENDING':
      return 'secondary';
    case 'FAILED':
      return 'destructive';
    case 'CANCELLED':
      return 'destructive';
    case 'RETRY':
      return 'secondary';
    default:
      return 'secondary';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'PAYMENT':
      return 'default';
    case 'SESSION':
      return 'secondary';
    case 'CUSTOM':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const columns = ({
  handleEdit,
  handleView,
  handleDelete,
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (id: number) => void;
}): ColumnDef<IReminder>[] => [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue<string>("type");
      return (
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <Badge variant={getTypeColor(type)}>
            {type}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue<string>("message");
      return (
        <div className="max-w-[200px] truncate">
          {message || <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "recipient",
    header: "Recipient",
    cell: ({ row }) => {
      const recipient = row.original.recipient;
      if (!recipient) return <span className="text-muted-foreground">-</span>;
      
      const fullName = recipient.profile 
        ? `${recipient.profile.firstName} ${recipient.profile.lastName}` 
        : recipient.email;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={recipient.profile?.avatar} />
            <AvatarFallback>
              {recipient.profile?.firstName?.[0]}{recipient.profile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{recipient.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "creator",
    header: "Created By",
    cell: ({ row }) => {
      const creator = row.original.creator;
      if (!creator) return <span className="text-muted-foreground">-</span>;
      
      const fullName = creator.profile 
        ? `${creator.profile.firstName} ${creator.profile.lastName}` 
        : creator.email;
      
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "scheduledAt",
    header: "Scheduled At",
    cell: ({ row }) => {
      const scheduledAt = row.getValue<string>("scheduledAt");
      
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">
              {format(new Date(scheduledAt), "MMM dd, yyyy")}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(scheduledAt), "HH:mm")}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status");
      const sentAt = row.original.sentAt;
      const sentCount = row.original.sentCount;
      
      return (
        <div className="space-y-1">
          <Badge variant={getStatusColor(status)}>
            {status.replace('_', ' ')}
          </Badge>
          {sentAt && (
            <div className="text-xs text-green-600">
              Sent: {format(new Date(sentAt), "MMM dd, HH:mm")}
            </div>
          )}
          {sentCount > 0 && (
            <div className="text-xs text-muted-foreground">
              Attempts: {sentCount}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
    cell: ({ row }) => {
      const frequency = row.getValue<string>("frequency");
      const isRecurring = row.original.isRecurring;
      
      return (
        <div>
          <Badge variant={isRecurring ? "default" : "outline"}>
            {frequency}
          </Badge>
          {isRecurring && (
            <div className="text-xs text-blue-600 mt-1">Recurring</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "deliveryMethods",
    header: "Delivery",
    cell: ({ row }) => {
      const deliveryMethods = row.getValue<string[]>("deliveryMethods") || [];
      return (
        <div className="flex flex-wrap gap-1">
          {deliveryMethods.map((method, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {method}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const reminder = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {handleView && (
              <DropdownMenuItem onClick={() => handleView(reminder.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {handleEdit && reminder.status === 'SCHEDULED' && (
              <DropdownMenuItem onClick={() => handleEdit(reminder.id)}>
                Edit Reminder
              </DropdownMenuItem>
            )}
            {handleDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(reminder.id)}
              >
                Delete Reminder
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const listItem = ({
  handleEdit,
  handleView,
  handleDelete,
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (id: number) => void;
}) => (reminder: IReminder) => {
  const recipient = reminder.recipient;
  const creator = reminder.creator;
  
  const recipientName = recipient?.profile 
    ? `${recipient.profile.firstName} ${recipient.profile.lastName}` 
    : recipient?.email || 'Unknown';
    
  const creatorName = creator?.profile 
    ? `${creator.profile.firstName} ${creator.profile.lastName}` 
    : creator?.email || 'Unknown';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock };
      case 'SENT':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: Mail };
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 'FAILED':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: Target };
      case 'CANCELLED':
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Target };
      case 'RETRY':
        return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Target };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'BILLING':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Target };
      case 'SESSION':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Calendar };
      case 'CUSTOM':
        return { color: 'bg-green-100 text-green-800 border-green-200', icon: Bell };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Bell };
    }
  };

  const statusConfig = getStatusConfig(reminder.status);
  const typeConfig = getTypeConfig(reminder.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <AppCard className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/20">
      <div className="p-3">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header with Title and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                    {reminder.title || 'Reminder'}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {reminder.type} Reminder
                </p>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
            
                <Badge className={`${statusConfig.color} border text-xs flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {reminder.status.replace('_', ' ')}
                </Badge>
                {reminder.isRecurring && (
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 border text-xs">
                    RECURRING
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Reminder Info - Responsive Layout */}
            <div className="space-y-2">
              {/* Schedule & Time */}
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                <CalendarDays className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="text-sm font-semibold text-blue-800">
                    {format(new Date(reminder.scheduledAt), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    {format(new Date(reminder.scheduledAt), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={recipient?.profile?.avatar} />
                  <AvatarFallback className="text-xs font-bold bg-green-100 text-green-600">
                    {recipient?.profile?.firstName?.[0]}{recipient?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="text-sm font-semibold text-green-800 truncate">{recipientName}</p>
                  <p className="text-xs text-green-600 truncate">{recipient?.email}</p>
                </div>
              </div>

              {/* Delivery & Type */}
              <div className="flex items-center gap-2 p-2 rounded bg-purple-50 border border-purple-200 sm:col-span-2 lg:col-span-1">
                <Target className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="text-sm font-semibold text-purple-800">
                    {reminder.isRecurring ? 'Recurring' : 'Once'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reminder.actions?.slice(0, 2).map((action: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white/50">
                        {action}
                      </Badge>
                    ))}
                    {reminder.actions && reminder.actions.length > 2 && (
                      <Badge variant="outline" className="text-xs bg-white/50">
                        +{reminder.actions.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            {reminder.message && (
              <div className="p-2 rounded bg-muted/20 border">
                <p className="text-sm text-muted-foreground">
                  {reminder.message}
                </p>
              </div>
            )}

            {/* Additional Status Info */}
            <div className="space-y-2">
              {reminder.sentAt && (
                <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                  <Mail className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sent</p>
                    <p className="text-sm font-medium text-green-700">
                      {format(new Date(reminder.sentAt), "MMM dd, h:mm a")}
                    </p>
                  </div>
                </div>
              )}
              
              {reminder.sentCount > 0 && (
                <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border">
                  <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-orange-600">{reminder.sentCount}</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Attempts</p>
                    <p className="text-sm font-medium">{reminder.sentCount}/{reminder.maxAttempts}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 self-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {handleView && (
                  <DropdownMenuItem onClick={() => handleView(reminder.id)}>
                    View Details
                  </DropdownMenuItem>
                )}
                {handleEdit && reminder.status === 'SCHEDULED' && (
                  <DropdownMenuItem onClick={() => handleEdit(reminder.id)}>
                    Edit Reminder
                  </DropdownMenuItem>
                )}
                {handleDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    Delete Reminder
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </AppCard>
  );
};

