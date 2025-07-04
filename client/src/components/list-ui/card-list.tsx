// React
import { ReactNode } from "react";

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

// Layout Components
import AppList, { AppListProps } from "../layout/app-list";

// Utils
import { cn } from "@/lib/utils";


interface CardListProps {
    className?: string;
    loading?: boolean;
    error?: string | null;
    title: string;
    description?: string;
    footerContent?: ReactNode;
    limit?: number
    children?: ReactNode
}

export default function CardList<T>({
    data,
    title,
    loading,
    error,
    description,
    footerContent,
    renderItem,
    className,
    children,
    emptyState,
    limit = 3,
}: CardListProps & AppListProps<T>) {
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
                    <AppList data={data} renderItem={renderItem} limit={limit} emptyState={emptyState} />

                    {error && (
                        <p className="text-sm font-medium text-red-500 my-2">{error}</p>
                    )}

                </CardContent>
                <CardFooter className="gap-1">

                    {footerContent}



                </CardFooter>

            </Card>
        </div>
    )

}
