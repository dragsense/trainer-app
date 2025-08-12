// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";


export const columns = ({
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
}
): ColumnDef<IUser>[] => [{
  accessorKey: "profile",
  header: "Profile",
  cell: ({ row }) => {
    const profile = row.original.profile;
    const name = profile ? `${profile.firstName} ${profile.lastName}` : '-';
    const imagePath = profile?.image?.path
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
  accessorKey: "profile",
  header: "Phone",
  cell: ({ row }) => {
    const profile = row.original.profile;
    return profile?.phoneNumber || '-';
  },
},
{
  accessorKey: "profile",
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
  accessorKey: "profile",
  header: "Certifications",
  cell: ({ row }) => {
    const profile = row.original.profile;
    const certifications = profile?.certifications || [];
    return (
      <div className="flex flex-wrap gap-1">
        {certifications.slice(0, 2).map((cert, index) => (
          <Badge key={index} variant="outline">
            {cert}
          </Badge>
        ))}
        {certifications.length > 2 && (
          <Badge variant="outline">+{certifications.length - 2}</Badge>
        )}
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
  },
},
  ];
