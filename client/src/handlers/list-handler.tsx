// React & Hooks
import React, { useEffect } from "react";

// Types
import { IPaginatedResponse } from "@/@types/api/response.type";
import {
  IListParams,
} from "@/@types/api/param.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

import {
  TItemActionProps,
  IExtraComponent,
} from "@/@types/handler-types";

// Custom Hooks
import { usePaginatedQuery } from "@/hooks/use-api-paginated-query";

// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";

// External Libraries
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { ISingleHandlerProps, SingleHandler } from "./single-handler";
import { ExtraComponentHandler } from "./extra-handler";


// Stores
import { useStore } from "zustand";
import { registerStore, deregisterStore, TListHandlerStore, useListHandlerStore, useRegisteredStore } from "@/stores";


interface IListHandlerProps<
  TData,
  TFormData,
  TResponse,
  TListExtraProps,
  TFormExtraProps,
  TSingleExtraProps
> extends ISingleHandlerProps<
  TData,
  TFormData,
  TResponse,
  TSingleExtraProps,
  TFormExtraProps> {
  name?: string;
  queryListFn: (params: IListParams) => Promise<IPaginatedResponse<TData>>;
  ListComponent: React.ComponentType<{ storeKey: string } & TListExtraProps>;
  extraComponents?: IExtraComponent<TListExtraProps>[];
  listProps?: TListExtraProps;


  initialPage?: number;
  initialLimit?: number;
  initialSortOrder?: "ASC" | "DESC";
  initialSortBy?: string;
  initialFilters?: Record<string, any>;


};

export function ListHandler<
  TData,
  TFormData extends Record<string, any> = any,
  TResponse = any,
  TListExtraProps extends Record<string, any> = Record<string, any>,
  TFormExtraProps extends Record<string, any> = Record<string, any>,
  TSingleExtraProps extends Record<string, any> = Record<string, any>
>({
  name = "Item",
  queryListFn,
  ListComponent,
  initialPage = 1,
  initialLimit = 10,
  initialSortOrder = "DESC",
  initialSortBy = "createdAt",
  initialFilters = {},
  listProps,
  extraComponents,
  queryFn,
  mutationFns,
  storeKey,
  SingleComponent,
  singleProps,
  formProps,
  FormComponent,
  onSuccess,
  onError,
  initialValues,
  validationMode = EVALIDATION_MODES.OnChange,
  validationSchema,
}: IListHandlerProps<
  TData,
  TFormData,
  TResponse,
  TListExtraProps,
  TFormExtraProps,
  TSingleExtraProps
>) {
  const queryClient = useQueryClient();

  const listStoreKey = storeKey + "-list"

  // Initialize store
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
      const response = await queryListFn(params);
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

  const handleInvalidateQuery = (_res: unknown) => {
    queryClient.invalidateQueries({
      queryKey,
    });

    if (onSuccess) {
      onSuccess(_res as TResponse);
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ListComponent
        storeKey={storeKey}
        
        {...(listProps as TListExtraProps)}
      />

      <SingleHandler<
        TData,
        TFormData,
        TResponse,
        TSingleExtraProps,
        TFormExtraProps
      >
        name={name}
        storeKey={storeKey}
        queryFn={queryFn}
        SingleComponent={SingleComponent}
        FormComponent={FormComponent}
        mutationFns={
          mutationFns
            ? {
              ...mutationFns,
              onSuccess: (action: string) => (res: unknown) => {
                handleInvalidateQuery(res);
                if (mutationFns.onSuccess) {
                  mutationFns.onSuccess(action)(res as TResponse);
                }
              },
            }
            : undefined
        }
        formProps={formProps}
        singleProps={singleProps}
        initialValues={initialValues}
        validationSchema={validationSchema}
        validationMode={validationMode}
      />


      <ExtraComponentHandler<TData, TListExtraProps>
        extraComponents={extraComponents}
        storeKey={storeKey}
        store={store}
        listProps={listProps as TListExtraProps}
        handleInvalidateQuery={handleInvalidateQuery}
      />

    </ErrorBoundary>
  );
}
