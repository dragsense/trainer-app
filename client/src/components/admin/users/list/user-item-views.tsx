// External Libraries
import { JSX } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Phone, Star } from "lucide-react";

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
import { IUser } from "@/@types/user.type";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";


const TrainerActions = ({
  trainer,
  handleEdit,
  handleDelete,
  handleView,
  handleViewClients,
  handleAssign
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
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (trainerId: number) => void;
  handleViewClients?: (trainerId: number) => void;
  handleAssign?: (trainerId: number) => void;
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
    {
      accessorKey: "profile.specialties",
      header: "Specialties",
      cell: ({ row }) => {
        const profile = row.original.profile;
        const specialties = profile?.specialties || [];
        return (
          <div className="flex flex-wrap gap-1">
            {specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        );
      },
    },
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
    const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown Trainer';
    const imagePath = profile?.image?.path;
    const specialties = profile?.specialties || [];
    const phoneNumber = profile?.phoneNumber || '-';

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/30">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Profile Image */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-background shadow-sm">
                {imagePath ? (
                  <img
                    src={encodeURI(`${API_URL}/${imagePath}`)}
                    alt={name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <h3 className="font-semibold text-lg md:text-xl truncate group-hover:text-primary transition-colors">{name}</h3>
                <Badge 
                  variant={item.isActive ? "default" : "secondary"} 
                  className="mt-2 sm:mt-0 sm:ml-2"
                >
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                {phoneNumber !== '-' && (
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 text-sm font-medium">
                    <Star className="h-4 w-4" />
                    <span>Specialties</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                    {specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
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