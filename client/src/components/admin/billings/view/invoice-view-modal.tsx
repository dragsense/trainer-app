// React & Hooks
import { useRef, useState } from "react";
import { useShallow } from 'zustand/shallow';
import printJS from "print-js";

// External Libraries
import { Calendar, Download } from "lucide-react";
import { format } from "date-fns";

// Types
import { IBilling } from "@/@types/billing.type";

// UI Components
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// Stores
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IInvoiceViewModalProps {
    storeKey: string;
}


export default function InvoiceViewModal({ storeKey }: IInvoiceViewModalProps) {

    const invoiceRef = useRef<HTMLDivElement>(null);



    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IBilling>>(singleStoreKey);

    if (!singleStore) return <div>Single store "{singleStoreKey}" not found.</div>;

    const { response: billing, action, reset } = singleStore(
        useShallow((state) => ({
            response: state.response,
            action: state.action,
            reset: state.reset,
        }))
    );

    if (!billing) return null;

    const handleClose = () => reset();

    const handleDownload = () => {
        if (!invoiceRef.current) return;
        printJS({
            printable: invoiceRef.current.id,
            type: "html",
            targetStyles: ["*"], // include all styles
        });
    };


    return (
        <Dialog open={action === "viewInvoice"} onOpenChange={handleClose}>
            <DialogContent className="min-w-5xl w-full p-10">

                <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                        <Download size={16} /> Download
                    </Button>
                </div>

                <div id="invoice-content" ref={invoiceRef} className="space-y-6">
                    <DialogHeader className="mb-6 border-b pb-4">
                        <div className="flex justify-between items-start">
                            {/* Company Info */}
                            <div>
                                <h2 className="text-2xl font-bold">Tech</h2>
                                <p className="text-muted-foreground">123 Business Street</p>
                                <p className="text-muted-foreground">City, Country</p>
                            </div>

                            {/* Invoice Meta */}
                            <div className="text-right">
                                <DialogTitle className="text-xl font-bold">Invoice</DialogTitle>
                                <p className="text-muted-foreground"><strong>No:</strong> {billing.localInvoiceNumber}</p>
                                <p className="flex items-center justify-end gap-1 text-muted-foreground">
                                    <Calendar size={14} /> {billing.issueDate ? format(new Date(billing.issueDate), "PPP") : "-"}
                                </p>
                                <p className="flex items-center justify-end gap-1 text-muted-foreground" >
                                    <Calendar size={14} /> Due: {billing.dueDate ? format(new Date(billing.dueDate), "PPP") : "-"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* BILL TO */}
                    <div className="mb-6">
                        <p className="font-semibold">Bill To:</p>
                        <p className="text-muted-foreground">{billing.user?.fullName || "Customer Name"}</p>
                        <p className="text-muted-foreground">{billing.user?.email}</p>
                    </div>

                    {/* STATUS TAGS */}
                    <div className="flex gap-2 mb-4">
                        <Badge>{billing.type.replace("_", " ")}</Badge>
                        <Badge>{billing.status.replace("_", " ")}</Badge>
                    </div>

                    {/* LINE ITEMS TABLE */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Unit Price</TableHead>
                                <TableHead className="text-right">Tax</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {billing.lineItems?.length ? (
                                billing.lineItems.map((item, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{item.unitPrice}</TableCell>
                                        <TableCell className="text-right">{item.tax ?? 0}</TableCell>
                                        <TableCell className="text-right">{item.amount}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No line items
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* TOTALS */}
                    <div className="mt-6 space-y-1 text-right">
                        <p>
                            <strong>Subtotal:</strong>{" "}
                            {billing.totalAmount - (billing.totalTax ?? 0) + (billing.discount ?? 0)}
                        </p>
                        <p>
                            <strong>Tax:</strong> {billing.totalTax ?? 0}
                        </p>
                        <p>
                            <strong>Discount:</strong> {billing.discount ?? 0}
                        </p>
                        <p className="text-lg font-bold">
                            Total: {billing.totalAmount ?? 0}
                        </p>
                    </div>

                    {/* NOTES */}
                    {billing.notes && (
                        <div className="mt-6">
                            <p className="font-medium">Notes</p>
                            <p>{billing.notes}</p>
                        </div>
                    )}

                    {/* TERMS */}
                    {billing.terms && (
                        <div className="mt-2">
                            <p className="font-medium">Terms</p>
                            <p>{billing.terms}</p>
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}
