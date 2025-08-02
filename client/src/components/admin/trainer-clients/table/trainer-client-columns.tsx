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
import { ITrainerClient } from "@/@types/trainer-client.type";

export const columns = ({
  handleEdit,
  handleDelete
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
}): ColumnDef<ITrainerClient>[] => [
  {
    accessorKey: "trainer",
    header: "Trainer",
    cell: ({ row }) => {
      const trainer = row.original.trainer;
      return trainer?.profile ? `${trainer.profile.firstName} ${trainer.profile.lastName}` : trainer?.email || '-';
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.client;
      return client?.profile ? `${client.profile.firstName} ${client.profile.lastName}` : client?.email || '-';
    },
  },
  {
    accessorKey: "trainer.email",
    header: "Trainer Email",
    cell: ({ row }) => {
      return row.original.trainer?.email || '-';
    },
  },
  {
    accessorKey: "client.email",
    header: "Client Email",
    cell: ({ row }) => {
      return row.original.client?.email || '-';
    },
  },
  {
    accessorKey: "assignedAt",
    header: "Assigned Date",
    cell: ({ row }) => {
      const date = row.original.assignedAt;
      return date ? new Date(date).toLocaleDateString() : '-';
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return date ? new Date(date).toLocaleDateString() : '-';
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
