// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, Clock, Bell, User } from "lucide-react";
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

// Types
import { IReminder, } from "@/@types/reminder.type";

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
  handleDelete,
  handleView
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
