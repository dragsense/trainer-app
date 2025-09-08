// React
import { useState, useEffect } from "react";

// External Libraries
import { Loader2 } from "lucide-react";
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";

// Custom Hooks
import { useTable } from "@/hooks/use-table";

// UI Components
import { AppTable } from "@/components/layout-ui/app-table";
import { Card, CardContent, CardHeader } from "../ui/card";

// Types
import { IListStoreApi } from "@/@types/handler-types";

// Utils
import { cn } from "@/lib/utils";

// Stores
import { useStore } from "zustand";


interface ICardTableProps<TData> {
  MainClassName?: string;
  error?: string | null;
  loading?: boolean;
  renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode;
  columns: ColumnDef<TData>[];
  listStore: IListStoreApi<TData>;
  onRowClick?: (row: TData) => void;
  pageSizeOptions?: number[];
  rowClassName?: (row: TData, index: number) => string;
  colClassName?: string;
  showPagination?: boolean;
  renderFooter?: (table: TanstackTable<TData>) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  showHeader?: boolean;
}

export function CardTable<TData>({
  columns,
  MainClassName,
  renderToolbar,
  listStore,
  pageSizeOptions,
  onRowClick,
  showPagination = true,
  renderFooter,
  emptyMessage = "No results found.",
  className = "",
  rowClassName,
  colClassName = "",
  showHeader = true,
}: ICardTableProps<TData>) {

  const {
    response: data,
    isLoading: loading,
    error,
    pagination,
    setPagination } = useStore(listStore);

  const onPageChange = (page: number) => {
    setPagination({ page });
  };
  const onLimitChange = (limit: number) => {
    setPagination({ limit });
  };


  const { table } = useTable<TData>({
    columns,
    data: data || [],
    defaultPageSize: pagination.limit || 10,
  });


  return (
    <Card className={cn(`py-4 gap-1`, MainClassName)}>
      <CardHeader className="px-4">
        {renderToolbar && renderToolbar(table)}
      </CardHeader>

      <CardContent className="px-4">
        {loading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        <AppTable
          onRowClick={onRowClick}
          emptyMessage={emptyMessage || "No results found."}
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          rowClassName={rowClassName}
          colClassName={colClassName}
          showPagination={showPagination}
          showHeader={showHeader}
          pageSizeOptions={pageSizeOptions}
          className={className}
          columns={columns}
          table={table}
          renderFooter={(table) => (
            <>
              {renderFooter && renderFooter(table)}
              {error && (
                <p className="text-sm font-medium text-red-500 my-2">
                  {error.message}
                </p>
              )}
            </>
          )}
        />
      </CardContent>
    </Card>
  );
}
