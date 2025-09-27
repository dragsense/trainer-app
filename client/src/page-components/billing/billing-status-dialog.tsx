import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AppDialog } from "@/components/layout-ui/app-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EBillingStatus } from "@shared/enums/billing.enum";

// Types
import { IBilling } from "@shared/interfaces/billing.interface";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TSingleHandlerStore } from "@/stores";
import { IFileUpload } from "@shared/interfaces/file-upload.interface";
// API
import { updateBillingStatus } from "@/services/billing.api";


const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:5000";


interface IBillingStatusDialogProps extends THandlerComponentProps<TSingleHandlerStore<IBilling, any>> {
}

export default function BillingStatusDialog({ storeKey, store }: IBillingStatusDialogProps) {

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response: billing, id, setAction } = store(
        useShallow((state) => ({
            action: state.action,
            id: state.id,
            response: state.response,
            setAction: state.setAction,
        }))
    );

    const [open, setOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<EBillingStatus | undefined>();
    const [existingDocs, setExistingDocs] = useState<IFileUpload[]>([]);
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
                        disabled={billing?.status === EBillingStatus.PAID}
                        value={selectedStatus}
                        onValueChange={(val: EBillingStatus) => setSelectedStatus(val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(EBillingStatus).map((status) => (
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
