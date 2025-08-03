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


export const columns = ({
  handleEdit,
  handleDelete,
  handleView,
  handleViewSessions,
  handleAssign
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
  handleView?: (id: number) => void;
  handleViewSessions?: (id: number) => void;
  handleAssign?: (id: number) => void;
}
): ColumnDef<IUser>[] => [

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
        const client = row.original;

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
                <DropdownMenuItem onClick={() => handleView(client.id)}>
                  View Details
                </DropdownMenuItem>
              )}
              {handleViewSessions && (
                <DropdownMenuItem onClick={() => handleViewSessions(client.id)}>
                  View Sessions
                </DropdownMenuItem>
              )}
              {handleAssign && (
                <DropdownMenuItem onClick={() => handleAssign(client.id)}>
                  Assign Trainer
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {handleEdit && (
                <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {handleDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(client.id)}
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
