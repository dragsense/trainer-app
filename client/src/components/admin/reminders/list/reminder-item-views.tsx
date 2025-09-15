// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, Clock, Bell, User, Mail, Target } from "lucide-react";
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
import { IReminder } from "@/@types/reminder.type";

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

  return (
    <AppCard className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/30">
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          <div className="flex-1 w-full space-y-4">
            {/* Header with Type and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg md:text-xl group-hover:text-primary transition-colors">
                  {reminder.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getTypeColor(reminder.type)} className="text-xs">
                  {reminder.type}
                </Badge>
                <Badge variant={getStatusColor(reminder.status)}>
                  {reminder.status.replace('_', ' ')}
                </Badge>
                {reminder.isRecurring && (
                  <Badge variant="outline" className="text-blue-600 text-xs">
                    Recurring
                  </Badge>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="p-3 rounded-lg bg-muted/20">
              <p className="font-medium text-sm leading-relaxed">
                {reminder.message || 'No message provided'}
              </p>
            </div>

            {/* Recipient and Creator Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                  <AvatarImage src={recipient?.profile?.avatar} />
                  <AvatarFallback className="text-sm font-semibold">
                    {recipient?.profile?.firstName?.[0]}{recipient?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">To: {recipientName}</div>
                  <div className="text-xs text-muted-foreground">{recipient?.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">From: {creatorName}</div>
                  <div className="text-xs text-muted-foreground">{creator?.email}</div>
                </div>
              </div>
            </div>

            {/* Schedule and Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {format(new Date(reminder.scheduledAt), "MMM dd, yyyy")}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(reminder.scheduledAt), "HH:mm")}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">{reminder.isRecurring ? 'Recurring' : 'Once'}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reminder.actions?.map((action: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          {/* Additional Info */}
          {reminder.sentAt && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Sent: {format(new Date(reminder.sentAt), "MMM dd, HH:mm")}
            </div>
          )}
          
          {reminder.sentCount > 0 && (
            <div className="text-xs text-muted-foreground">
              Attempts: {reminder.sentCount}
            </div>
          )}
        </div>

          {/* Actions */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
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
