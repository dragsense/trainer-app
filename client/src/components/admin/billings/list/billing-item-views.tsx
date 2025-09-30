// External Libraries
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Calendar, DollarSign, User, FileText, Download, Send, ArrowDownLeft, ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
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
import { IBilling, IStripeInvoice, IStripeTransaction } from "@shared/interfaces/billing.interface";
import { EBillingStatus } from "@shared/enums/billing.enum";
import { cn } from "@/lib/utils";


const getStatusConfig = (status: EBillingStatus) => {
  const statusConfig: Record<EBillingStatus, { color: string; label: string }> = {
    [EBillingStatus.PAID]: {
      color: "bg-green-100 text-green-800",
      label: "Paid",
    },
    [EBillingStatus.PENDING]: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pending",
    },
    [EBillingStatus.FAILED]: {
      color: "bg-red-100 text-red-800",
      label: "Failed",
    },
    [EBillingStatus.OVERDUE]: {
      color: "bg-orange-100 text-orange-800",
      label: "Overdue",
    },
  };
  return statusConfig[status] || statusConfig[EBillingStatus.PENDING];
};

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
}): ColumnDef<IBilling>[] => [
  {
    accessorKey: "localInvoiceNumber",
    header: "Invoice No.",
    cell: ({ row }) => {
      const invoiceNumber = row.getValue<string>("localInvoiceNumber");
      return (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{invoiceNumber}</span>
        </div>
      );
    },
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
      if (!user) return <span className="text-muted-foreground">-</span>;
      
      const fullName = user.profile 
        ? `${user.profile.firstName} ${user.profile.lastName}` 
        : user.email;
      
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profile?.avatar} />
            <AvatarFallback>
              {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "issueDate",
    header: "Issued On",
    cell: ({ row }) => {
      const date = row.getValue<string>("issueDate");
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(date), "MMM dd, yyyy")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue<string>("dueDate");
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(new Date(date), "MMM dd, yyyy")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue<number>("invoiceAmount");
      const currency = row.original.currency;
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{currency} {(amount / 100).toFixed(2)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue<number>("totalAmount");
      const currency = row.original.currency;
      return total ? (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{currency} {(total / 100).toFixed(2)}</span>
        </div>
      ) : "—";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<EBillingStatus>("status");
      const config = getStatusConfig(status);
      
      return (
        <Badge 
          onClick={updateStatus && (() => updateStatus(row.original.id))} 
          className={cn(config.color, "cursor-pointer")}
        >
          {config.label}
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
            {handleView && (
              <DropdownMenuItem onClick={() => handleView(billing.id)}>
                View Details
              </DropdownMenuItem>
            )}
            {handleViewInvoice && (
              <DropdownMenuItem onClick={() => handleViewInvoice(billing.id)}>
                View Invoice
              </DropdownMenuItem>
            )}
            {handleEdit && (
              <DropdownMenuItem onClick={() => handleEdit(billing.id)}>
                Edit Billing
              </DropdownMenuItem>
            )}
            {handleDelete && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(billing.id)}
              >
                Delete Billing
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
  handleDelete,
  updateStatus,
  handleViewInvoice
}: {
  handleEdit?: (id: number) => void;
  handleView?: (id: number) => void;
  handleDelete?: (id: number) => void;
  updateStatus?: (id: number) => void;
  handleViewInvoice?: (id: number) => void;
}) => (billing: IBilling) => {
  const user = billing.user;
  
  const userName = user?.profile 
    ? `${user.profile.firstName} ${user.profile.lastName}` 
    : user?.email || 'Unknown';
    
  const config = getStatusConfig(billing.status);
  const isOverdue = billing.status === 'pending' && new Date(billing.dueDate) < new Date();

  return (
    <AppCard className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50 bg-gradient-to-br from-background to-muted/20">
      <div className="p-3">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-3">
            {/* Header with Invoice Number and Status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                    {billing.localInvoiceNumber || `Invoice #${billing.id}`}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {billing.type?.replace("_", " ")} Invoice
                </p>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
             
                <Badge variant="outline" className="text-xs">
                  {billing.type?.replace("_", " ")}
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 border text-xs">
                    OVERDUE
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Billing Info - Responsive Layout */}
            <div className="space-y-3">
              {/* Amount & Currency */}
              <div className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200">
                <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-sm font-semibold text-green-800">
                    {billing.currency.toUpperCase()} {(billing.invoiceAmount / 100).toFixed(2)}
                  </p>
                  {billing.totalAmount && billing.totalAmount !== billing.invoiceAmount && (
                    <p className="text-xs text-green-600">
                      Total: {billing.currency.toUpperCase()} {(billing.totalAmount / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Due Date & Issue Date */}
              <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                <CalendarDays className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-blue-800'}`}>
                    {format(new Date(billing.dueDate), "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    Issued: {format(new Date(billing.issueDate), "MMM dd")}
                  </p>
                </div>
              </div>

              {/* Client Information */}
              <div className="flex items-center gap-2 p-2 rounded bg-purple-50 border border-purple-200 sm:col-span-2 lg:col-span-1">
                <Avatar className="h-6 w-6 flex-shrink-0">
                  <AvatarImage src={user?.profile?.avatar} />
                  <AvatarFallback className="text-xs font-bold bg-purple-100 text-purple-600">
                    {user?.profile?.firstName?.[0]}{user?.profile?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="text-sm font-semibold text-purple-800 truncate">{userName}</p>
                  <p className="text-xs text-purple-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Stripe Invoice ID */}
            {billing.stripeInvoiceId && (
              <div className="flex items-center gap-2 p-2 rounded bg-muted/20 border">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Stripe ID: {billing.stripeInvoiceId}</span>
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
                  <DropdownMenuItem onClick={() => handleView(billing.id)}>
                    View Details
                  </DropdownMenuItem>
                )}
                {handleViewInvoice && (
                  <DropdownMenuItem onClick={() => handleViewInvoice(billing.id)}>
                    View Invoice
                  </DropdownMenuItem>
                )}
                {handleEdit && (
                  <DropdownMenuItem onClick={() => handleEdit(billing.id)}>
                    Edit Billing
                  </DropdownMenuItem>
                )}
                {handleDelete && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(billing.id)}
                  >
                    Delete Billing
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

// Invoice columns for Stripe invoices
export const invoiceColumns: ColumnDef<IStripeInvoice>[] = [
  {
    accessorKey: "number",
    header: "Invoice",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{row.original.number}</div>
          <div className="text-sm text-muted-foreground">{row.original.id}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
    cell: ({ row }) => {
      if (!row.original.customer_name || !row.original.customer_email) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{row.original.customer_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.customer_email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
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
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">
          ${row.original.amount_due} {row.original.currency?.toUpperCase() || 'USD'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>
          {row.original?.due_date && new Date(row.original.due_date).toLocaleDateString()}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.invoice_pdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(row.original.invoice_pdf, "_self")}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        {row.original.hosted_invoice_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(row.original.hosted_invoice_url, "_blank")}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  },
];

// Transaction columns for Stripe transactions
export const transactionColumns: ColumnDef<IStripeTransaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.type === "refund" ? (
          <ArrowDownLeft className="h-4 w-4 text-red-600" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-green-600" />
        )}
        <div>
          <div className="font-medium">{row.original.id}</div>
          {row.original.paymentIntentId && (
            <div className="text-sm text-muted-foreground">
              {row.original.paymentIntentId}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-sm text-muted-foreground">{row.original.customerEmail}</div>
        </div>
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
      <div className={`flex items-center gap-2 font-medium ${row.original.type === "refund" ? "text-red-600" : "text-green-600"}`}>
        <DollarSign className="h-4 w-4" />
        <span>
          {row.original.type === "refund" ? "-" : "+"}${row.original.amount.toFixed(2)} {row.original.currency.toUpperCase()}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "created",
    header: "Date",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{new Date(row.original.created).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.receiptUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(row.original.receiptUrl, "_blank")}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  },
];
