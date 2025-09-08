// React & Hooks
import { useEffect, useState } from "react";

// External libraries
import {  Filter, XIcon } from "lucide-react";

// Types
import {  IStripeInvoice } from "@/@types/billing.type";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom UI Components
import { TableDateFilter } from "@/components/table-ui/table-date-filter";
import { CardTable } from "@/components/table-ui/card-table";

// Stores
import { TListHandlerStore, useRegisteredStore } from "@/stores";
import { invoiceColumns } from "./billing-columns";



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


 

    const renderFilters = (
        <>
            <TableDateFilter
                placeholder="Joined After"
                value={filters.joinedAfter ? new Date(filters.joinedAfter) : undefined}
                onSelect={(date) =>
                    handleFilterChange("joinedAfter", date?.toISOString())
                }
            />
            <TableDateFilter
                placeholder="Joined Before"
                value={filters.joinedBefore ? new Date(filters.joinedBefore) : undefined}
                onSelect={(date) =>
                    handleFilterChange("joinedBefore", date?.toISOString())
                }
            />
        </>
    );


    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Invoices</h2>
                    <p className="text-muted-foreground">
                        Manage Stripe invoices and payment tracking
                    </p>
                </div>
            </div>

            <CardTable<IStripeInvoice>
                listStore={listStore}
                columns={invoiceColumns}
                renderToolbar={() => (
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <h3 className="text-bold">Billings</h3>

                        <div className="flex flex-1 justify-between items-center gap-2">
                            <div className="flex-1 flex items-center gap-2">
                                <Input
                                    placeholder="Search billings..."
                                    value={filters.search || ""}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                    className="max-w-sm"
                                />
                                <div className="xl:hidden flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            collisionPadding={20}
                                            align="start"
                                            className="w-64 p-2"
                                        >
                                            <div className="flex flex-col gap-2">{renderFilters}</div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="hidden xl:flex items-center gap-2">
                                    {renderFilters}
                                </div>

                                {hasActiveFilters && (
                                    <Button variant="outline" onClick={handleClearFilters}>
                                        <XIcon />{" "}
                                        <span className="hidden lg:inline">Clear Filters</span>
                                    </Button>
                                )}
                            </div>
                    
                        </div>
                    </div>
                )}
                emptyMessage="No billings found."
                showPagination
            />
        </div>
    );
} 