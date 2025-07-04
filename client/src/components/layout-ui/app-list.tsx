import React, { JSX } from "react";

export interface AppListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  limit?: number;
  emptyState?: JSX.Element

}

export default function AppList<T>({ data, renderItem, limit, emptyState }: AppListProps<T>) {
  const list = limit ? data.slice(0, limit) : data;

  return (
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
  );
}
