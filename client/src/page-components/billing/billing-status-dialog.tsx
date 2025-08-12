import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BillingStatus } from "#/modules/v1/billings/enums/billing.enum";

// Types
import { IBilling } from "@/@types/billing.type";
import { TActionComponentProps } from "@/@types/handler-types";
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { FileUpload } from "#/modules/v1/file-upload/entities/file-upload.entity";

// API
import { updateBillingStatus } from "@/services/billing.api";
import { set } from "date-fns";


const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";


interface IBillingStatusDialogProps extends TActionComponentProps<any> {
    storeKey: string;
}

export default function BillingStatusDialog({ storeKey }: IBillingStatusDialogProps) {
    const singleStoreKey = `${storeKey}-single`;
    const singleStore = useRegisteredStore<TSingleHandlerStore<IBilling>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
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
    const [existingDocs, setExistingDocs] = useState<FileUpload[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [removedDocIds, setRemovedDocIds] = useState<number[]>([]);

    useEffect(() => {
        if (id && billing) {
            setSelectedStatus(billing.status);
            setExistingDocs(billing.documents);
            setOpen(true);
        }
    }, [id, billing]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return; // Exit if null

        setNewFiles((prev) => [...prev, ...Array.from(files)]);
    };

    const handleRemoveFile = (index: number, isExisting = false) => {
        if (isExisting) {
            setRemovedDocIds((prev) => [...prev, existingDocs[index].id]);
            setExistingDocs((prev) => prev.filter((_, i) => i !== index));
        } else {
            setNewFiles((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleConfirm = async () => {
        if (!billing || !selectedStatus) return;

        try {
            await updateBillingStatus(id!)({
                status: selectedStatus,
                documents: newFiles,
                removedDocuments: removedDocIds,
            });

            toast.success(`Billing status & documents updated`);
            setNewFiles([]);
            setRemovedDocIds([]);
            setAction("none");
            setOpen(false);
        } catch (error) {
            toast.error("Failed to update: " + error);
            console.error(error);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) setAction("none");
                setOpen(isOpen);
            }}
        >
            <DialogContent className="max-w-2xl">
                <AppDialog
                    title="Update Billing Status & Documents"
                    description={`Change status and manage documents for invoice "${billing?.localInvoiceNumber}"`}
                    footerContent={
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirm}>Save Changes</Button>
                        </div>
                    }
                >
                    {/* Status Select */}
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

                    {/* Existing Documents */}
                    <div className="mt-4">
                        <h4 className="mb-2 font-semibold">Existing Documents</h4>
                        <div className="space-y-2">
                            {existingDocs.length > 0 ? existingDocs.map((doc, idx) => (
                                <div key={doc.id} className="flex justify-between items-center border p-2 rounded">
                                    <a href={encodeURI(`${API_URL}/${doc.path}`)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                        {doc.name}
                                    </a>
                                    <Button size="sm" variant="destructive" onClick={() => handleRemoveFile(idx, true)}>Remove</Button>
                                </div>
                            )) : <p className="text-gray-500 text-sm">No documents uploaded</p>}
                        </div>
                    </div>

                    {/* New Documents */}
                    <div className="mt-4">
                        <h4 className="mb-2 font-semibold">Add New Documents</h4>
                        <input type="file" multiple onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="block w-full" />
                        <div className="space-y-2 mt-2">
                            {newFiles.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center border p-2 rounded">
                                    <span>{file.name}</span>
                                    <Button size="sm" variant="outline" onClick={() => handleRemoveFile(idx)}>Remove</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </AppDialog>
            </DialogContent>
        </Dialog>
    );
}
