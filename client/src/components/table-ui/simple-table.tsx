// React
import { useState, useEffect } from "react";

// External Libraries
import { Loader2 } from "lucide-react";
import { ColumnDef, Table as TanstackTable } from "@tanstack/react-table";

// Custom Hooks
import { useTable } from "@/hooks/use-table";

// UI Components
import { AppTable, TableBaseProps } from "../layout/app-table";

// Utils
import { cn } from "@/lib/utils";


interface SimpleTableProps<T> {
  MainClassName?: string;
  error?: string | null;
  loading?: boolean;
  renderToolbar?: (table: TanstackTable<T>) => React.ReactNode;
  columns: ColumnDef<T>[];
  data: T[];
  defaultPageSize?: number;
}

export function SimpleTable<TData>({
  columns,
  data,
  MainClassName,
  loading,
  renderToolbar,
  showHeader,
  defaultPageSize = 10,
  showPagination,
  error,
  ...props
}: SimpleTableProps<TData> & TableBaseProps<TData>) {
  const { table } = useTable<TData>({
    columns,
    data,
    defaultPageSize,
  });

  const [tableError, setTableError] = useState(error);

  useEffect(() => {
    setTableError(error);
  }, [error]);

  return (
    <div className={cn("relative flex flex-col gap-3", MainClassName)}>
      {loading && (
        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {renderToolbar && renderToolbar(table)}
     
      <AppTable
        onRowClick={props.onRowClick}
        emptyMessage={props.emptyMessage || "No results found."}
        pagination={props.pagination}
        onPageChange={props.onPageChange}
        onLimitChange={props.onLimitChange}
        rowClassName={props.rowClassName}
        colClassName={props.colClassName}
        showHeader={showHeader}
        showPagination={showPagination}
        columns={columns}
        table={table}
        renderFooter={(table) => (
          <>
            {props.renderFooter && props.renderFooter(table)}
            {tableError && (
              <p className="text-sm font-medium text-red-500 my-2">
                {tableError}
              </p>
            )}
          </>
        )}
      />
    </div>
  );
}
