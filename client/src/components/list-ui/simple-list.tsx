// React
import { ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";

// Layout Components
import AppList, { AppListProps } from "../layout/app-list";

// Utils
import { cn } from "@/lib/utils";


interface SimpleListProps {
    className?: string;
    loading?: boolean;
    error?: string | null;
    limit?: number
    children?: ReactNode
}

export default function SimpleList<T>({
    data,
    loading,
    error,
    renderItem,
    className,
    children,
    emptyState,
    limit = 3,
}: SimpleListProps & AppListProps<T>) {
    return (
        <div className={cn("relative flex flex-col gap-6", className)}>
            {loading && (
                <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}

            {children}
            <AppList data={data} renderItem={renderItem} limit={limit} emptyState={emptyState} />

            {error && (
                <p className="text-sm font-medium text-red-500 my-2">{error}</p>
            )}
        </div>
    )

}
