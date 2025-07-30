// React
import { JSX, ReactNode } from "react";

// External Libraries
import { Loader2 } from "lucide-react";

// UI Components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";

// Handlers
import { IListStoreApi } from "@/@types/handler-types";


// Utils
import { cn } from "@/lib/utils";

// Stores
import { useStore } from "zustand";


interface ICardListProps<TData> {
    className?: string;
    title: string;
    description?: string;
    footerContent?: ReactNode;
    limit?: number
    children?: ReactNode,
    renderItem: (item: TData, index: number) => React.ReactNode;
    emptyState?: JSX.Element
    listStore: IListStoreApi<TData>;
}

export default function CardList<TData>({
    title,
    description,
    footerContent,
    renderItem,
    className,
    children,
    emptyState,
    listStore,
    limit = 3,
}: ICardListProps<TData>) {

    const { response: data, isLoading: loading, error } = useStore(listStore);

    let list = limit ? data?.slice(0, limit) : data;
    list = list || [];

    return (
        <div className={cn("relative flex flex-col gap-6", className)}>
            {loading && (
                <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>

                <CardContent>
                    {children}

                    <div className="space-y-3">
                        {list.length > 0 ? list.map((item, index) => (
                            <div key={index}>
                                {renderItem(item, index)}
                            </div>
                        )) : (
                            emptyState ||
                            <div className="text-sm text-muted-foreground">
                                No data found
                            </div>
                        )}
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-500 my-2">{error.message}</p>
                    )}

                </CardContent>
                <CardFooter className="gap-1">
                    {footerContent}
                </CardFooter>

            </Card>
        </div>
    )

}
