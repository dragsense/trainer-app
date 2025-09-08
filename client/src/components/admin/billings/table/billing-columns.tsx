// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDownLeft, ArrowUpRight, Download, MoreHorizontal, RefreshCw, Send } from "lucide-react";
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
import { IBilling, IStripeInvoice, IStripeTransaction } from "@/@types/billing.type";
import { Badge } from "@/components/ui/badge";
import { BillingStatus } from "#/modules/v1/billings/enums/billing.enum";
import { cn } from "@/lib/utils";


export const columns = ({
  handleEdit,
  handleView,
  handleDelete,
  updateStatus,
  handleViewInvoice
}: {
  handleEdit?: (id: number) => void;
  handleView?: (id: number) => void;
  handleDelete?: (id: number) => void;
  updateStatus?: (id: number) => void;
  handleViewInvoice?: (id: number) => void;

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
        const status = row.getValue<BillingStatus>("status");

        const statusConfig: Record<BillingStatus, { color: string; label: string }> = {
          [BillingStatus.PAID]: {
            color: "bg-green-100 text-green-800",
            label: "Paid",
          },
          [BillingStatus.PENDING]: {
            color: "bg-yellow-100 text-yellow-800",
            label: "Pending",
          },
          [BillingStatus.FAILED]: {
            color: "bg-red-100 text-red-800",
            label: "Failed",
          },
          [BillingStatus.OVERDUE]: {
            color: "bg-orange-100 text-orange-800",
            label: "Overdue",
          },
        };

        const config =
          statusConfig[status as BillingStatus] || statusConfig[BillingStatus.PENDING];

        return <Badge onClick={updateStatus && (() => updateStatus(row.original.id))} className={cn(config.color, "cursor-pointer")}>{config.label}</Badge>;
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
              {handleView && (
                <DropdownMenuItem onClick={() => handleView(billing.id)}>
                  View
                </DropdownMenuItem>
              )}
              {handleViewInvoice && (
                <DropdownMenuItem onClick={() => handleViewInvoice(billing.id)}>
                  View Invoice
                </DropdownMenuItem>
              )}

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



export const invoiceColumns: ColumnDef<IStripeInvoice>[] = [
  {
    accessorKey: "number",
    header: "Invoice",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.number}</div>
        <div className="text-sm text-muted-foreground">{row.original.id}</div>
      </div>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => {

      if (!row.original.customer_name || !row.original.customer_email) {
        return null;
      }
      return (
        <div>
          <div className="font-medium">{row.original.customer_name}</div>
          <div className="text-sm text-muted-foreground">{row.original.customer_email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusConfig = {
        paid: { color: "bg-green-100 text-green-800", label: "Paid" },
        open: { color: "bg-yellow-100 text-yellow-800", label: "Open" },
        void: { color: "bg-red-100 text-red-800", label: "Void" },
        draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
        uncollectible: { color: "bg-red-100 text-red-800", label: "Uncollectible" },
      };
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
      return <Badge className={config.color}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "amount_due",
    header: "Amount",
    cell: ({ row }) => `$${row.original.amount_due} ${row.original.currency.toUpperCase()}`,
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => (
      <div className="text-sm">
        <div>{row.original?.due_date && new Date(row.original.due_date).toLocaleDateString()}</div>
        {/* {row.original?.paid_date && (
            <div className="text-muted-foreground">
              Paid: {new Date(row.original.paid_date).toLocaleDateString()}
            </div>
          )} */}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {/* <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button> */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (row.original.invoice_pdf) {
              window.open(row.original.invoice_pdf, "_self");
            }
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (row.original.hosted_invoice_url) {
              window.open(row.original.hosted_invoice_url, "_blank");
            }
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
        {/* <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button> */}
      </div>
    ),
  },
];


export const transactionColumns: ColumnDef<IStripeTransaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.id}</div>
        {row.original.paymentIntentId && (
          <div className="text-sm text-muted-foreground">
            {row.original.paymentIntentId}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.customerName}</div>
        <div className="text-sm text-muted-foreground">{row.original.customerEmail}</div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.type === "refund" ? (
          <ArrowDownLeft className="h-4 w-4 text-red-600" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        )}
        <span className="capitalize">{row.original.type}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig = {
        succeeded: { color: "bg-green-100 text-green-800", label: "Succeeded" },
        failed: { color: "bg-red-100 text-red-800", label: "Failed" },
        pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
        canceled: { color: "bg-gray-100 text-gray-800", label: "Canceled" },
      };
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
      return <Badge className={config.color}>{config.label}</Badge>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className={`font-medium ${row.original.type === "refund" ? "text-red-600" : "text-green-600"}`}>
        {row.original.type === "refund" ? "-" : "+"}${row.original.amount.toFixed(2)} {row.original.currency.toUpperCase()}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate text-muted-foreground">
        {row.original.description || "—"}
      </div>
    ),
  },
  {
    accessorKey: "created",
    header: "Date",
    cell: ({ row }) => new Date(row.original.created).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {/* <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button> */}
        {row.original.receiptUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(row.original.receiptUrl, "_blank")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {/* <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button> */}
      </div>
    ),
  },
];