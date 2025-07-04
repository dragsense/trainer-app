import { ItemActionProps } from "../general.type";

export interface IListBaseProps<TData> {
  data: TData[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onFilterChange: (filters: Record<string, any>) => void;
  setItemAction: ({ itemName, action, id }: ItemActionProps) => void;
}



