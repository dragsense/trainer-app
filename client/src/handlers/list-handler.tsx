// React & Hooks
import React, { useState } from "react";

// Types
import  { IPaginatedResponse } from "@/@types/api/response.type";
import {
  ListParamsWithId,
  IListParams,
} from "@/@types/api/param.type";
import {
  ItemActionProps,
  IMessageResponse,
} from "@/@types/general.type";
import {
  IExtraComponent,
  ExtraComponentProps,
  IFormBaseProps,
  IListBaseProps,
  ISingleBaseProps,
  MutationFns,
} from "@/@types/handler-types";

// Custom Hooks
import { usePaginatedQuery } from "@/hooks/use-api-paginated-query";

// External Libraries
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { SingleHandler } from "./single-handler";

interface ExtraComponentRendererProps<TListExtraProps> {
  extraComponents?: IExtraComponent<TListExtraProps>[];
  itemAction: ItemActionProps | null;
  setItemAction: React.Dispatch<React.SetStateAction<ItemActionProps | null>>;
  listProps: TListExtraProps;
  handleInvalidateQuery: (res: unknown) => void;
}

const useExtraComponentsMap = <TListExtraProps,>(
  components: IExtraComponent<TListExtraProps>[] | undefined
) => {
  return React.useMemo(() => {
    if (!components) return null;

    return components.reduce((acc, extra) => {
      acc[extra.trigerAction] = extra.comp;
      return acc;
    }, {} as Record<string, React.ComponentType<ExtraComponentProps<TListExtraProps>>>);
  }, [components]);
};

const ExtraComponentHandler = <TListExtraProps,>({
  extraComponents,
  itemAction,
  setItemAction,
  listProps,
  handleInvalidateQuery,
}: ExtraComponentRendererProps<TListExtraProps>) => {
  const extraComponentsMap = useExtraComponentsMap(extraComponents);
  const currentAction = itemAction?.extraAction;

  return React.useMemo(() => {
    if (!currentAction || !extraComponentsMap) return null;

    const ExtraComp = extraComponentsMap[currentAction];

    if (!ExtraComp) return null;

    return (
      <ExtraComp
        key={`extra-comp-${currentAction}`}
        itemAction={itemAction}
        setItemAction={setItemAction}
        handleInvalidateQuery={handleInvalidateQuery}
        {...listProps}
      />
    );
  }, [currentAction, extraComponentsMap, itemAction, setItemAction, listProps]);
};

interface ListHandlerProps<
  TData,
  TFormData,
  TResponse,
  TListExtraProps,
  TFormExtraProps,
  TSingleExtraProps
>  {
  queryKey: string | any[];
  queryFn: (params: IListParams) => Promise<IPaginatedResponse<TData>>;
  ListComponent: React.ComponentType<IListBaseProps<TData> & TListExtraProps>;
  FormComponent?: React.ComponentType<
    IFormBaseProps<TFormData, TResponse> & TFormExtraProps
  >;
  SingleComponent?: React.ComponentType<
    ISingleBaseProps<TData> & TSingleExtraProps
  >;
  extraComponents?: IExtraComponent<TListExtraProps>[];
  queryKeySingle?: string | any[];
  queryFnSingle?: (params: ListParamsWithId) => Promise<TData>;
  mutationFns?: MutationFns<TFormData, TResponse>;
  listProps?: TListExtraProps;
  formProps?: TFormExtraProps;
  singleProps?: TSingleExtraProps;
  initialPage?: number;
  initialLimit?: number;
  initialSortOrder?: "ASC" | "DESC";
  initialSortBy?: string;
  initialFilters?: Record<string, any>;
};

export function ListHandler<
  TData,
  TFormData = any,
  TResponse = any,
  TListExtraProps = any,
  TFormExtraProps = any,
  TSingleExtraProps = any
>({
  queryKey,
  queryFnSingle,
  queryFn,
  mutationFns,
  ListComponent,
  FormComponent,
  SingleComponent,
  initialPage = 1,
  initialLimit = 10,
  initialSortOrder = "DESC",
  initialSortBy = "createdAt",
  initialFilters = {},
  listProps,
  formProps,
  singleProps,
  extraComponents,
}: ListHandlerProps<
  TData,
  TFormData,
  TResponse,
  TListExtraProps,
  TFormExtraProps,
  TSingleExtraProps
>) {
  const queryClient = useQueryClient();
  const [itemAction, setItemAction] = useState<ItemActionProps | null>(null);

  const { data, isLoading, error, pagination, setPage, setLimit, setFilters } =
    usePaginatedQuery<TData>(queryKey, queryFn, {
      page: initialPage,
      limit: initialLimit,
      sortBy: initialSortBy,
      sortOrder: initialSortOrder,
      filters: initialFilters,
    });

  const handleInvalidateQuery = (res: unknown) => {
    queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });
  };

  return (
    <>
      <ListComponent
        data={data?.data || []}
        loading={isLoading}
        error={error?.message || null}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onFilterChange={setFilters}
        setItemAction={setItemAction}
        {...(listProps as TListExtraProps)}
      />

      <SingleHandler<
        TData,
        TFormData,
        TResponse,
        TSingleExtraProps,
        TFormExtraProps & any
      >
        params={{ id: itemAction?.id || 0 }}
        queryKey={[(queryKey || "no") + "_item", itemAction?.id || 0]}
        queryFn={
          queryFnSingle && itemAction?.id
            ? queryFnSingle
            : () => Promise.reject("No query function available")
        }
        SingleComponent={SingleComponent}
        FormComponent={FormComponent}
        mutationFns={
          mutationFns
            ? {
                ...mutationFns,
                onSuccess: (action: string) => (res: unknown) => {
                  handleInvalidateQuery(res);

                  if (mutationFns.onSuccess) {
                    mutationFns.onSuccess(action)(
                      res as TResponse | IMessageResponse | void
                    );
                  }
                },
              }
            : mutationFns
        }
        itemAction={itemAction}
        formProps={formProps as TFormExtraProps}
        singleProps={singleProps as TSingleExtraProps}
      />

      <ExtraComponentHandler
        extraComponents={extraComponents}
        itemAction={itemAction}
        setItemAction={setItemAction}
        listProps={listProps}
        handleInvalidateQuery={handleInvalidateQuery}
      />
    </>
  );
}
