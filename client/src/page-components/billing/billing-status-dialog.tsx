import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

// UI
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillingStatus } from "#/modules/v1/billings/enums/billing.enum";

// Types
import { IBilling } from "@/@types/billing.type";
import { TActionComponentProps } from "@/@types/handler-types";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// API
import { updateBillingStatus } from "@/services/billing.api";
import { Button } from "@/components/ui/button";

interface IBillingStatusDialogProps extends TActionComponentProps<any> {
    storeKey: string;
}

export default function BillingStatusDialog({
    storeKey,
}: IBillingStatusDialogProps) {
    const singleStoreKey = `${storeKey}-single`;
    const singleStore = useRegisteredStore<
        TSingleHandlerStore<IBilling>
    >(singleStoreKey);

    if (!singleStore) {
        return (
            <div>
                Single store "{singleStoreKey}" not found. Did you forget to register it?
            </div>
        );
    }

    const { response: billing, id, setAction } = singleStore(
        useShallow((state) => ({
            action: state.action,
            id: state.id,
            response: state.response,
            setAction: state.setAction,
        }))
    );

    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<BillingStatus | undefined>();

    useEffect(() => {
        if (id && billing) {
            setSelectedStatus(billing.status);
            setOpen(true);
        }
    }, [id, billing]);

    const handleConfirm = async () => {
        if (!billing || !selectedStatus) return;

        try {
            await updateBillingStatus(id!)({ status: selectedStatus });
            toast.success(`Billing status updated to "${selectedStatus}"`);
        } catch (error) {
            toast.error("Failed to update billing status");
            console.error(error);
        } finally {
            setAction("none");
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) setAction("none");
            setOpen(isOpen);
        }}>
            <DialogContent>
                <AppDialog
                    title="Update Billing Status"
                    description={`Change the status for invoice "${billing?.localInvoiceNumber}"`}
                    footerContent={
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button

                                onClick={handleConfirm}
                            >
                                Update
                            </Button>
                        </div>
                    }
                >
                    <Select
                        disabled={billing?.status === BillingStatus.PAID}
                        value={selectedStatus}
                        onValueChange={(val: BillingStatus) => setSelectedStatus(val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(BillingStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}
