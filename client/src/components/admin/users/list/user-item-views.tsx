// External Libraries
import { JSX } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Phone, Star, User, Shield } from "lucide-react";

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

// Types
import { IUser } from "@shared/interfaces/user.interface";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EUserLevels } from "@shared/enums/user.enum";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";


const TrainerActions = ({
  trainer,
  handleEdit,
  handleDelete,
  handleView,
  handleViewClients,
  handleAssign,
}: {
  trainer: IUser;
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (trainerId: number) => void;
  handleViewClients?: (trainerId: number) => void;
  handleAssign?: (trainerId: number) => void;
}) => {
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
          <DropdownMenuItem onClick={() => handleView(trainer.id)}>
            View Details
          </DropdownMenuItem>
        )}
        {handleViewClients && (
          <DropdownMenuItem onClick={() => handleViewClients(trainer.id)}>
            View Clients
          </DropdownMenuItem>
        )}
        {handleAssign && (
          <DropdownMenuItem onClick={() => handleAssign(trainer.id)}>
            Assign Client
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {handleEdit && (
          <DropdownMenuItem onClick={() => handleEdit(trainer.id)}>
            Edit
          </DropdownMenuItem>
        )}
        {handleDelete && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => handleDelete(trainer.id)}
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const itemViews = ({
  handleEdit,
  handleDelete,
  handleView,
  handleViewClients,
  handleAssign,
  level
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (trainerId: number) => void;
  handleViewClients?: (trainerId: number) => void;
  handleAssign?: (trainerId: number) => void;
  level: number;
}): {
  columns: ColumnDef<IUser>[];
  listItem: (item: IUser) => JSX.Element;
} => {
  const columns: ColumnDef<IUser>[] = [
    {
      accessorKey: "profile.image",
      header: "Profile",
      cell: ({ row }) => {
        const profile = row.original.profile;
        const name = profile ? `${profile.firstName} ${profile.lastName}` : '-';
        const imagePath = profile?.image?.path;
        return (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            {imagePath ? (
              <img
                src={encodeURI(`${API_URL}/${imagePath}`)}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              name.charAt(0)
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "profile",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original.profile;
        return profile ? `${profile.firstName} ${profile.lastName}` : '-';
      },
    },
    {
      accessorKey: "profile.phoneNumber",
      header: "Phone",
      cell: ({ row }) => {
        const profile = row.original.profile;
        return profile?.phoneNumber || '-';
      },
    },
    ...(level === EUserLevels.TRAINER ? [{
      accessorKey: "profile.specialties",
      header: "Specialties",
      cell: ({ row }: { row: Row<IUser> }) => {
        const profile = row.original.profile;
        const specialties = profile?.specialties || [];
        return (
          <div className="flex flex-wrap gap-1">
            {specialties.map((specialty: string, index: number) => (
              <Badge key={index} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        );
      },
    }] : []),
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue<boolean>("isActive");
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const trainer = row.original;

        return (
          <TrainerActions
            trainer={trainer}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            handleView={handleView}
            handleViewClients={handleViewClients}
            handleAssign={handleAssign}

          />
        );
      },
    },
  ];

  const listItem = (item: IUser) => {
    const profile = item.profile;
    const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown User';
    const imagePath = profile?.image?.path;
    const specialties = profile?.specialties || [];
    const phoneNumber = profile?.phoneNumber || '-';

    const getUserRole = (level: number) => {
      switch (level) {
        case 0: return { label: 'Super Admin', color: 'bg-red-100 text-red-800 border-red-200' };
        case 1: return { label: 'Trainer', color: 'bg-green-100 text-green-800 border-green-200' };
        case 2: return { label: 'Client', color: 'bg-blue-100 text-blue-800 border-blue-200' };
        default: return { label: 'User', color: 'bg-gray-100 text-gray-800 border-gray-200' };
      }
    };

    const roleConfig = getUserRole(item.level);

    return (
     
      <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="flex-1 w-full space-y-3">
              {/* Header with Name and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                    {name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {roleConfig.label}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Badge className={`${roleConfig.color} border text-xs`}>
                    {roleConfig.label}
                  </Badge>
                  <Badge className={
                    item.isActive 
                      ? 'bg-green-100 text-green-800 border-green-200 border text-xs' 
                      : 'bg-gray-100 text-gray-800 border-gray-200 border text-xs'
                  }>
                    {item.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Profile Image and Contact Info */}
              <div className="flex items-center gap-2 p-2 rounded bg-primary/5 border border-primary/20">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {imagePath ? (
                    <img
                      src={encodeURI(`${API_URL}/${imagePath}`)}
                      alt={name}
                      className="w-8 h-8 rounded object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{item.email}</span>
                    </div>
                    {phoneNumber !== '-' && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Specialties */}
              {specialties.length > 0 && level === EUserLevels.TRAINER && (
                <div className="p-2 rounded bg-secondary/5 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-3 w-3 text-secondary" />
                    <p className="text-xs font-semibold text-secondary">Specialties</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {specialties.slice(0, 4).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-white/50">
                        {specialty}
                      </Badge>
                    ))}
                    {specialties.length > 4 && (
                      <Badge variant="outline" className="text-xs bg-white/50">
                        +{specialties.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

        
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 self-start">
              <TrainerActions
                trainer={item}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleView={handleView}
                handleViewClients={handleViewClients}
                handleAssign={handleAssign}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return { columns, listItem };
};