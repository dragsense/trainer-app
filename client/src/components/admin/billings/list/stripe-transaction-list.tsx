// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import { Filter, XIcon } from "lucide-react";

// Types
import { IStripeTransaction } from "@/@types/billing.type";

// UI Components


// Custom UI Components
import { Table } from "@/components/table-ui/table";
import { transactionColumns } from "./billing-columns";
import { AppCard } from "@/components/layout-ui/app-card";
import { TransactionFilters } from "./transaction-filters";

// Stores
import { TListHandlerStore, useRegisteredStore } from "@/stores";




interface IStripeTransactionTableProps {
    storeKey: string;
}

export default function StripeTransactionTable({
    storeKey,
}: IStripeTransactionTableProps) {

    const listStoreKey = storeKey + "-list";

    const listStore = useRegisteredStore<TListHandlerStore<IStripeTransaction>>(listStoreKey);

    if (!listStore) {
        return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
    }

    const setListFilters = listStore(state => state.setFilters);

    const [filters, setFilters] = useState<Record<string, any>>({});

    const hasActiveFilters = Object.keys(filters).length > 0;
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
                    <h3 className="text-bold">Transactions</h3>

                    <div className="flex flex-1 justify-between items-center gap-2">
                        <TransactionFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </div>
                </div>
            }>
            <Table<IStripeTransaction>
                listStore={listStore}
                columns={transactionColumns}

                emptyMessage="No transactions found."
                showPagination
            />

        </AppCard>
    );
} 