// React & Hooks
import React, { useEffect } from "react";

// Types
import { IPaginatedResponse } from "@/@types/api/response.type";
import {
  IListParams,
} from "@/@types/api/param.type";

// Custom Hooks
import { usePaginatedQuery } from "@/hooks/use-api-paginated-query";

// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";


// Stores
import { registerStore, deregisterStore, TListHandlerStore, useListHandlerStore, useRegisteredStore } from "@/stores";


interface IListHandlerProps<
  TData,
  TListExtraProps
> {
  storeKey: string;
  queryFn: (params: IListParams) => Promise<IPaginatedResponse<TData>>;
  ListComponent: React.ComponentType<{ storeKey: string } & TListExtraProps>;
  listProps?: TListExtraProps;
  initialPage?: number;
  initialLimit?: number;
  initialSortOrder?: "ASC" | "DESC";
  initialSortBy?: string;
  initialFilters?: Record<string, any>;
};

export function ListHandler<
  TData,
  TListExtraProps extends Record<string, any> = Record<string, any>,
>({
  queryFn,
  ListComponent,
  initialPage = 1,
  initialLimit = 10,
  initialSortOrder = "DESC",
  initialSortBy = "createdAt",
  initialFilters = {},
  listProps,
  storeKey
}: IListHandlerProps<
  TData,
  TListExtraProps
>) {
  const listStoreKey = storeKey + "-list"

  let store = useRegisteredStore<TListHandlerStore<TData>>(listStoreKey);
  if (!store) {
    store = useListHandlerStore<TData>();
    registerStore<TListHandlerStore<TData>>(listStoreKey, store);
  }

  useEffect(() => {
    registerStore(listStoreKey, store);
    return () => deregisterStore(listStoreKey);
  }, [listStoreKey, store]);


  const queryKey = [listStoreKey];


  usePaginatedQuery<TData>(queryKey, async (params) => {
    store.setState({ isLoading: true });
    try {
      const response = await queryFn(params);
      store.setState({
        response: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          lastPage: response.lastPage,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        },
        isLoading: false,
        error: null,
        isSuccess: true,
        filters: params.filters || {},
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'DESC',
        search: params.search || ''
      });
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      store.setState({
        response: null,
        pagination: {
          page: 1,
          limit: initialLimit,
          total: 0,
          lastPage: 1,
          hasNextPage: false,
          hasPrevPage: false
        },
        isLoading: false,
        error: err,
        isSuccess: false,
        filters: {},
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        search: ''
      });
      throw err;
    }
  }, {
    page: initialPage,
    limit: initialLimit,
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
    filters: initialFilters,
  });

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ListComponent
        storeKey={storeKey}
        {...(listProps as TListExtraProps)}
      />
    </ErrorBoundary>
  );
}
