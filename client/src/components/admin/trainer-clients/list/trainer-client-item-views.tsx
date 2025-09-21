// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, User, Users, Mail, Phone, MapPin, Target, CalendarDays, Clock3, Timer } from "lucide-react";
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

  const getDaysSinceAssignment = (assignedAt: Date | string) => {
    const assigned = new Date(assignedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - assigned.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysSinceAssignment = getDaysSinceAssignment(assignment.assignedAt);

  return (
    <AppCard className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/20">
      <div className="p-3">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header with Assignment Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                    Trainer-Client Assignment
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Active partnership • {daysSinceAssignment} days
                </p>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Badge className="bg-green-100 text-green-800 border-green-200 border text-xs">
                  ACTIVE
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {daysSinceAssignment} days
                </Badge>
              </div>
            </div>

            {/* Trainer and Client Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trainer Info */}
              <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/20">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={trainer?.profile?.avatar} />
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {trainer?.profile?.firstName?.[0]}{trainer?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{trainerName}</p>
                  <p className="text-xs text-muted-foreground">Trainer</p>
                  <p className="text-xs text-muted-foreground truncate">{trainer?.email}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-2 p-2 rounded bg-secondary/5 border border-secondary/20">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={client?.profile?.avatar} />
                  <AvatarFallback className="text-xs font-bold bg-secondary/10 text-secondary">
                    {client?.profile?.firstName?.[0]}{client?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{clientName}</p>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="text-xs text-muted-foreground truncate">{client?.email}</p>
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                <CalendarDays className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Assigned</p>
                  <p className="text-sm font-semibold text-blue-800">
                    {format(new Date(assignment.assignedAt), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-blue-600">
                    {daysSinceAssignment} days ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                <Target className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-semibold text-green-800">Active</p>
                  <p className="text-xs text-green-600">
                    Created: {format(new Date(assignment.createdAt), "MMM dd")}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties and Goals - Responsive */}
            {(trainer?.profile?.specialties?.length > 0 || client?.profile?.fitnessGoals?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trainer?.profile?.specialties && trainer.profile.specialties.length > 0 && (
                  <div className="p-2 rounded bg-purple-50 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3 text-purple-600" />
                      <p className="text-xs font-semibold text-purple-800">Trainer Specialties</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {trainer.profile.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/50">
                          {specialty}
                        </Badge>
                      ))}
                      {trainer.profile.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-white/50">
                          +{trainer.profile.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {client?.profile?.fitnessGoals && client.profile.fitnessGoals.length > 0 && (
                  <div className="p-2 rounded bg-orange-50 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-3 w-3 text-orange-600" />
                      <p className="text-xs font-semibold text-orange-800">Client Goals</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {client.profile.fitnessGoals.slice(0, 2).map((goal, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-white/50">
                          {goal}
                        </Badge>
                      ))}
                      {client.profile.fitnessGoals.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-white/50">
                          +{client.profile.fitnessGoals.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
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
        </div>
      </div>
    </AppCard>
  );
};
