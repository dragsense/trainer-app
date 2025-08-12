// React & Hooks
import { useState } from "react";
import { useShallow } from 'zustand/shallow';

// External Libraries
import { Calendar } from "lucide-react";
import { format } from "date-fns";

// Types
import { IBilling } from "@/@types/billing.type";

// UI Components
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";



// Stores
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IBillingViewModalProps {
  storeKey: string;
}

export default function BillingViewModal({
  storeKey
}: IBillingViewModalProps) {

  const singleStoreKey = storeKey + "-single";
  const singleStore = useRegisteredStore<TSingleHandlerStore<IBilling>>(singleStoreKey);

  if (!singleStore) {
    return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }


  const { response: billing, action, reset } = singleStore(useShallow(state => ({
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{billing.localInvoiceNumber}</DialogTitle>
              <DialogDescription>Billing Details</DialogDescription>
            </div>
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