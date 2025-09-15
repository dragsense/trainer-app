// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import { Filter, XIcon } from "lucide-react";

// Types
import { IStripeInvoice } from "@/@types/billing.type";

// UI Components

// Custom UI Components
import { Table } from "@/components/table-ui/table";
import { invoiceColumns } from "./billing-columns";

import { AppCard } from "@/components/layout-ui/app-card";
import { InvoiceFilters } from "./invoice-filters";
// Stores
import { TListHandlerStore, useRegisteredStore } from "@/stores";




interface IStripeInvoiceTableProps {
    storeKey: string;
}

export default function StripeInvoiceTable({
    storeKey,
}: IStripeInvoiceTableProps) {

    const listStoreKey = storeKey + "-list";

    const listStore = useRegisteredStore<TListHandlerStore<IStripeInvoice>>(listStoreKey);

    if (!listStore) {
        return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
    }

    const setListFilters = listStore(state => state.setFilters);

    const [filters, setFilters] = useState<Record<string, any>>({});

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[key] = value;
        } else {
            delete newFilters[key];
        }
        setFilters(newFilters);
    };

    useEffect(() => {
        let timer = null;

        timer = setTimeout(() => {
            setListFilters(filters);
        }, 500);

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [filters]);

    const handleClearFilters = () => {
        setFilters({});
    };





    return (
        <AppCard
            header={
                <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                    <h3 className="text-bold">Invoices</h3>

                    <div className="flex flex-1 justify-between items-center gap-2">
                        <InvoiceFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                </div>
            }
        >
            <Table<IStripeInvoice>
                listStore={listStore}
                columns={invoiceColumns}

                emptyMessage="No billings found."
                showPagination
            />

        </AppCard>
    );
} 