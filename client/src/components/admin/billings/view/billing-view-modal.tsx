// React & Hooks
import { useState } from "react";

// External Libraries
import { Edit2, MapPin, Clock, DollarSign, Users, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

// Types
import { IBilling } from "@/@types/billing.type";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Components
import BillingFormModal from "../form/billing-form-modal";

// Stores
import { useStore } from "zustand";
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IBillingViewModalProps {
  billing: IBilling;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeKey: string;
}

export default function BillingViewModal({ 
  billing, 
  open, 
  onOpenChange,
  storeKey 
}: IBillingViewModalProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const singleStoreKey = storeKey + "-single";
  const singleStore = useRegisteredStore<TSingleHandlerStore<IBilling>>(singleStoreKey);

  const { setMode } = useStore(singleStore!);

  const handleEdit = () => {
    setShowEditForm(true);
    setMode("edit", billing.id);
    onOpenChange(false);
  };

  if (showEditForm) {
    return <BillingFormModal storeKey={storeKey} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{billing.localInvoiceNumber}</DialogTitle>
              <DialogDescription>Billing Details</DialogDescription>
            </div>
            <Button onClick={handleEdit} size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Badge>{billing.type.replace("_", " ")}</Badge>
            <Badge>{billing.status.replace("_", " ")}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Issue Date</p>
                <p className="text-sm text-gray-600">
                  {billing.issueDate ? format(new Date(billing.issueDate), 'PPP') : '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Due Date</p>
                <p className="text-sm text-gray-600">
                  {billing.dueDate ? format(new Date(billing.dueDate), 'PPP') : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Line Items</p>
            <div className="space-y-2 text-sm text-gray-700">
              {billing.lineItems?.map((item, index) => (
                <div key={index} className="border p-2 rounded">
                  <p><strong>Description:</strong> {item.description}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Unit Price:</strong> {item.unitPrice}</p>
                  <p><strong>Amount:</strong> {item.amount}</p>
                  <p><strong>Tax:</strong> {item.tax ?? 0}</p>
                </div>
              )) || <p className="text-gray-500">No line items</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Total Tax</p>
              <p className="text-sm text-gray-600">{billing.totalTax ?? 0}</p>
            </div>
            <div>
              <p className="font-medium">Discount</p>
              <p className="text-sm text-gray-600">{billing.discount ?? 0}</p>
            </div>
            <div>
              <p className="font-medium">Total Amount</p>
              <p className="text-sm text-gray-600">{billing.totalAmount ?? 0}</p>
            </div>
          </div>

          {billing.notes && (
            <div>
              <p className="font-medium">Notes</p>
              <p className="text-sm text-gray-600">{billing.notes}</p>
            </div>
          )}

          {billing.terms && (
            <div>
              <p className="font-medium">Terms</p>
              <p className="text-sm text-gray-600">{billing.terms}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}