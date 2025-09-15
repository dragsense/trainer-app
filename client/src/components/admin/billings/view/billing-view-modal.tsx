// External Libraries
import { ReactNode } from "react";
import { useShallow } from 'zustand/shallow';

// Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppCard } from "@/components/layout-ui/app-card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Target, 
  Download,
  Send,
  CreditCard,
  Receipt
} from "lucide-react";

// Types
import { IBilling } from "@/@types/billing.type";
import { BillingStatus } from "#/modules/v1/billings/enums/billing.enum";

// Stores
import { TSingleHandlerStore } from "@/stores";

interface IBillingViewModalProps {
  storeKey: string;
  store: TSingleHandlerStore<IBilling, any>;
}

export default function BillingViewModal({ storeKey, store }: IBillingViewModalProps) {
  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
  }

  const { response: billing, action, reset } = store(useShallow(state => ({
    response: state.response,
    action: state.action,
    reset: state.reset,
  })));

  if (!billing) {
    return null;
  }

  const handleCloseView = () => {
    reset();
  };

  return (
    <Dialog open={action === 'view'} onOpenChange={handleCloseView}>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <AppDialog
          title="Billing Details"
          description="View detailed information about this billing"
        >
          <BillingDetailContent billing={billing} />
        </AppDialog>
      </DialogContent>
    </Dialog>
  );
}

interface IBillingDetailContentProps {
  billing: IBilling;
}

function BillingDetailContent({ billing }: IBillingDetailContentProps) {
  // Helper function to render info items
  const InfoItem = ({ icon, label, value, className = "" }: {
    icon: ReactNode;
    label: string;
    value: string | number | undefined | null | ReactNode;
    className?: string;
  }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <span className="text-sm text-muted-foreground">{label}:</span>
        <p className="font-medium">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  const getStatusColor = (status: BillingStatus) => {
    switch (status) {
      case BillingStatus.PAID: return 'default';
      case BillingStatus.PENDING: return 'secondary';
      case BillingStatus.FAILED: return 'destructive';
      case BillingStatus.OVERDUE: return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusConfig = (status: BillingStatus) => {
    const statusConfig: Record<BillingStatus, { color: string; label: string }> = {
      [BillingStatus.PAID]: { color: "bg-green-100 text-green-800", label: "Paid" },
      [BillingStatus.PENDING]: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      [BillingStatus.FAILED]: { color: "bg-red-100 text-red-800", label: "Failed" },
      [BillingStatus.OVERDUE]: { color: "bg-orange-100 text-orange-800", label: "Overdue" },
    };
    return statusConfig[status] || statusConfig[BillingStatus.PENDING];
  };

  const config = getStatusConfig(billing.status);

  return (
    <div className="space-y-6">
      {/* Quick Preview Card */}
      <AppCard className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {billing.localInvoiceNumber}
            </h2>
            <p className="text-emerald-600 font-medium">
              {billing.type?.replace("_", " ")} Invoice
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={config.color}>
                {config.label}
              </Badge>
              <Badge variant="secondary">
                {billing.type?.replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(billing.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </AppCard>

      <div className="">
        {/* Basic Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <div>
                <span className="font-semibold">Invoice Information</span>
                <p className="text-sm text-muted-foreground">Basic invoice details and identification</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<FileText className="w-4 h-4" />}
              label="Invoice Number"
              value={billing.localInvoiceNumber}
            />
            <InfoItem
              icon={<Target className="w-4 h-4" />}
              label="Type"
              value={billing.type?.replace("_", " ")}
            />
            <InfoItem
              icon={<Target className="w-4 h-4" />}
              label="Status"
              value={config.label}
            />
            {billing.stripeInvoiceId && (
              <InfoItem
                icon={<CreditCard className="w-4 h-4" />}
                label="Stripe Invoice ID"
                value={billing.stripeInvoiceId}
              />
            )}
          </div>
        </AppCard>

        {/* Financial Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              <div>
                <span className="font-semibold">Financial Information</span>
                <p className="text-sm text-muted-foreground">Amounts, taxes, and payment details</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<DollarSign className="w-4 h-4" />}
              label="Invoice Amount"
              value={`${billing.currency} ${(billing.invoiceAmount / 100).toFixed(2)}`}
            />
            {billing.totalTax && (
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label="Total Tax"
                value={`${billing.currency} ${(billing.totalTax / 100).toFixed(2)}`}
              />
            )}
            {billing.discount && (
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label="Discount"
                value={`${billing.currency} ${(billing.discount / 100).toFixed(2)}`}
              />
            )}
            {billing.totalAmount && (
              <InfoItem
                icon={<DollarSign className="w-4 h-4" />}
                label="Total Amount"
                value={`${billing.currency} ${(billing.totalAmount / 100).toFixed(2)}`}
              />
            )}
            <InfoItem
              icon={<CreditCard className="w-4 h-4" />}
              label="Currency"
              value={billing.currency}
            />
          </div>
        </AppCard>

        {/* Dates and Timeline */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="font-semibold">Dates and Timeline</span>
                <p className="text-sm text-muted-foreground">Important dates for this invoice</p>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Issue Date"
              value={new Date(billing.issueDate).toLocaleDateString()}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Due Date"
              value={new Date(billing.dueDate).toLocaleDateString()}
            />
            {billing.paidDate && (
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="Paid Date"
                value={new Date(billing.paidDate).toLocaleDateString()}
              />
            )}
          </div>
        </AppCard>

        {/* Customer Information */}
        {billing.user && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Customer Information</span>
                  <p className="text-sm text-muted-foreground">Details about the customer for this invoice</p>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <InfoItem
                icon={<User className="w-4 h-4" />}
                label="Customer Name"
                value={
                  billing.user.profile 
                    ? `${billing.user.profile.firstName} ${billing.user.profile.lastName}`
                    : billing.user.email
                }
              />
              <InfoItem
                icon={<Mail className="w-4 h-4" />}
                label="Email"
                value={billing.user.email}
              />
              {billing.user.profile?.phoneNumber && (
                <InfoItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Phone Number"
                  value={billing.user.profile.phoneNumber}
                />
              )}
              {billing.user.profile?.address && (
                <InfoItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={billing.user.profile.address}
                />
              )}
            </div>
          </AppCard>
        )}

        {/* Additional Information */}
        {(billing.notes || billing.terms) && (
          <AppCard
            header={
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <div>
                  <span className="font-semibold">Additional Information</span>
                  <p className="text-sm text-muted-foreground">Notes, terms, and other details</p>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              {billing.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Notes:</span>
                  </div>
                  <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                    {billing.notes}
                  </p>
                </div>
              )}
              {billing.terms && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Terms:</span>
                  </div>
                  <p className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                    {billing.terms}
                  </p>
                </div>
              )}
            </div>
          </AppCard>
        )}

        {/* Additional Information */}
        <AppCard
          header={
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="font-semibold">System Information</span>
                <p className="text-sm text-muted-foreground">Creation and update timestamps</p>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Created At"
              value={new Date(billing.createdAt).toLocaleString()}
            />
            <InfoItem
              icon={<Calendar className="w-4 h-4" />}
              label="Updated At"
              value={new Date(billing.updatedAt).toLocaleString()}
            />
          </div>
        </AppCard>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-2" />
            View Receipt
          </Button>
          <Button size="sm">
            Edit Billing
          </Button>
        </div>
      </div>
    </div>
  );
}