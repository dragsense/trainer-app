// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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

// Types
import { ISession } from "@/@types/session.type";
import { Badge } from "@/components/ui/badge";


export const columns = ({
  handleEdit,
  handleView,
  handleDelete
}: {
  handleEdit?: (id: number) => void;
  handleView?: (id: number) => void;
  handleDelete?: (id: number) => void;
}
): ColumnDef<ISession>[] => [
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        return (
          <Badge variant="secondary">
            {type?.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: "trainer",
      header: "Trainer",
      cell: ({ row }) => {
        const trainer = row.original.trainer;
        return trainer?.profile ?
          `${trainer.profile.firstName} ${trainer.profile.lastName}` :
          trainer?.email || '-';
      },
    },
    {
      accessorKey: "clientCount",
      header: "Total Clients",
      cell: ({ row }) => {
        const clientCount = row.getValue<number>("clientCount");
        return clientCount || 0;
      },
    },

    {
      accessorKey: "dateTime",
      header: "Date & Time",
      cell: ({ row }) => {
        const dateTime = row.getValue<string>("dateTime");
        const duration = row.original.duration;
        return (
          <div>
            <div>{format(new Date(dateTime), "MMM dd, yyyy")}</div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(dateTime), "HH:mm")} ({duration}min)
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "pricePerClient",
      header: "Price Per Client",
      cell: ({ row }) => {
        const price = row.getValue<number>("pricePerClient");
        const currency = row.original.currency;
        return `${currency || 'USD'} ${price}`;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return (
          <Badge variant={status === 'COMPLETED' ? "default" : "secondary"}>
            {status?.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const session = row.original;

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
                <DropdownMenuItem onClick={() => handleView(session.id)}>
                  View
                </DropdownMenuItem>
              )}
              {handleEdit && (
                <DropdownMenuItem onClick={() => handleEdit(session.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {handleDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(session.id)}
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
