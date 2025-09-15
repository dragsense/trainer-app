// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, User, Users, Mail, Phone, MapPin, Target } from "lucide-react";
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
import { ITrainerClient } from "@/@types/trainer-client.type";

export const columns = ({
  handleEdit,
  handleView,
  handleDelete
}: {
  handleEdit?: (id: number) => void;
  handleView?: (id: number) => void;
  handleDelete?: (id: number) => void;
}): ColumnDef<ITrainerClient>[] => [
  {
    accessorKey: "trainer",
    header: "Trainer",
    cell: ({ row }) => {
      const trainer = row.original.trainer;
      if (!trainer) return <span className="text-muted-foreground">-</span>;
      
      const fullName = trainer.profile 
        ? `${trainer.profile.firstName} ${trainer.profile.lastName}` 
        : trainer.email;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={trainer.profile?.avatar} />
            <AvatarFallback>
              {trainer.profile?.firstName?.[0]}{trainer.profile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{trainer.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.client;
      if (!client) return <span className="text-muted-foreground">-</span>;
      
      const fullName = client.profile 
        ? `${client.profile.firstName} ${client.profile.lastName}` 
        : client.email;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={client.profile?.avatar} />
            <AvatarFallback>
              {client.profile?.firstName?.[0]}{client.profile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{client.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "assignedAt",
    header: "Assigned Date",
    cell: ({ row }) => {
      const date = row.original.assignedAt;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{date ? format(new Date(date), "MMM dd, yyyy") : '-'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{date ? format(new Date(date), "MMM dd, yyyy") : '-'}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const assignment = row.original;

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
              <DropdownMenuItem onClick={() => handleView(assignment.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {handleEdit && (
              <DropdownMenuItem onClick={() => handleEdit(assignment.id)}>
                Edit Assignment
              </DropdownMenuItem>
            )}
            {handleDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(assignment.id)}
              >
                Remove Assignment
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
  handleDelete
}: {
  handleEdit?: (id: number) => void;
  handleView?: (id: number) => void;
  handleDelete?: (id: number) => void;
}) => (assignment: ITrainerClient) => {
  const trainer = assignment.trainer;
  const client = assignment.client;
  
  const trainerName = trainer?.profile 
    ? `${trainer.profile.firstName} ${trainer.profile.lastName}` 
    : trainer?.email || 'Unknown';
    
  const clientName = client?.profile 
    ? `${client.profile.firstName} ${client.profile.lastName}` 
    : client?.email || 'Unknown';

  return (
    <AppCard className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-4">
          {/* Header with Assignment Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Trainer-Client Assignment</span>
            </div>
            <Badge variant="outline" className="text-blue-600">
              Active
            </Badge>
          </div>

          {/* Trainer and Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trainer Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Trainer</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={trainer?.profile?.avatar} />
                  <AvatarFallback>
                    {trainer?.profile?.firstName?.[0]}{trainer?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{trainerName}</div>
                  <div className="text-sm text-muted-foreground">{trainer?.email}</div>
                  {trainer?.profile?.phoneNumber && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {trainer.profile.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Client</span>
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={client?.profile?.avatar} />
                  <AvatarFallback>
                    {client?.profile?.firstName?.[0]}{client?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{clientName}</div>
                  <div className="text-sm text-muted-foreground">{client?.email}</div>
                  {client?.profile?.phoneNumber && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.profile.phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Assigned Date</div>
                <div className="text-sm text-muted-foreground">
                  {assignment.assignedAt ? format(new Date(assignment.assignedAt), "MMM dd, yyyy") : 'Not specified'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  {assignment.createdAt ? format(new Date(assignment.createdAt), "MMM dd, yyyy") : 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {trainer?.profile?.specialties && trainer.profile.specialties.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Trainer Specialties</div>
              <div className="flex flex-wrap gap-1">
                {trainer.profile.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {client?.profile?.fitnessGoals && client.profile.fitnessGoals.length > 0 && (
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Client Goals</div>
              <div className="flex flex-wrap gap-1">
                {client.profile.fitnessGoals.map((goal, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
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
              <DropdownMenuItem onClick={() => handleView(assignment.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {handleEdit && (
              <DropdownMenuItem onClick={() => handleEdit(assignment.id)}>
                Edit Assignment
              </DropdownMenuItem>
            )}
            {handleDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(assignment.id)}
              >
                Remove Assignment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </AppCard>
  );
};
