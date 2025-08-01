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
import { IBilling } from "@/@types/billing.type";
import { Badge } from "@/components/ui/badge";


export const columns = ({
  handleEdit,
  handleDelete
}: {
  handleEdit?: (id: number) => void;
  handleDelete?: (id: number) => void;
}
): ColumnDef<IBilling>[] => [
    {
      accessorKey: "localInvoiceNumber",
      header: "Invoice No.",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue<string>("type");
        return (
          <Badge variant="secondary">
            {type?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "user",
      header: "Member",
      cell: ({ row }) => {
        const user = row.original.user;
        return user?.profile
          ? `${user.profile.firstName} ${user.profile.lastName}`
          : user?.email || "-";
      },
    },
    {
      accessorKey: "issueDate",
      header: "Issued On",
      cell: ({ row }) => {
        const date = row.getValue<string>("issueDate");
        return format(new Date(date), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const date = row.getValue<string>("dueDate");
        return format(new Date(date), "MMM dd, yyyy");
      },
    },
    {
      accessorKey: "invoiceAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue<number>("invoiceAmount");
        const currency = row.original.currency;
        return `${currency} ${amount / 100}`;
      },
    },
    {
      accessorKey: "totalTax",
      header: "Tax",
      cell: ({ row }) => {
        const tax = row.getValue<number>("totalTax");
        return tax ? `${tax / 100}` : "—";
      },
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const discount = row.getValue<number>("discount");
        return discount ? `${discount / 100}` : "—";
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total",
      cell: ({ row }) => {
        const total = row.getValue<number>("totalAmount");
        const currency = row.original.currency;
        return total ? `${currency} ${total / 100}` : "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue<string>("status");
        return (
          <Badge variant={status === "COMPLETED" ? "default" : "secondary"}>
            {status?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const billing = row.original;

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
                <DropdownMenuItem onClick={() => handleEdit(billing.id)}>
                  Edit
                </DropdownMenuItem>
              )}
              {handleDelete && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDelete(billing.id)}
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
