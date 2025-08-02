// React & Hooks
import React, { useEffect, useMemo } from "react";

// Types
import {
  MutationFns
} from "@/@types/handler-types";
import { EVALIDATION_MODES } from "@/enums/form.enums";


// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useConfirm } from "@/hooks/use-confirm";

// External Libraries
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";

// Handlers
import { FormHandler, IFormHandlerProps } from "./form-handler";

// UI Components
import { ConfirmDialog } from "@/components/layout-ui/app-alert-dialog";

// Stores
import { deregisterStore, registerStore, TSingleHandlerStore, useRegisteredStore, useSingleHandlerStore } from "@/stores";
import { useStore } from "zustand";
import { TQueryParams } from "@/@types/api/param.type";

export type TSingleFormExtraProps<TData> = {
  open: boolean;
  closeForm: () => void;
  values: TData | null;
  isEditMode: boolean;
};

export interface ISingleHandlerProps<
  TData,
  TUpdateData,
  TResponse,
  TSingleExtraProps,
  TFormExtraProps
> extends Omit<IFormHandlerProps<TUpdateData, TResponse, TFormExtraProps>, 'mutationFn'> {
  name?: string;
  id?: number,
  initialParams?: TQueryParams 
  queryFn: (id: number) => Promise<TData>;
  SingleComponent?: React.ComponentType<{ storeKey: string } & TSingleExtraProps
  >;
  mutationFns?: MutationFns<TUpdateData, TResponse>;
  singleProps?: TSingleExtraProps;
}

export function SingleHandler<
  TData,
  TUpdateData extends Record<string, any> = any,
  TResponse = any,
  TSingleExtraProps = any,
  TFormExtraProps extends Record<string, any> = Record<string, any>
>({
  name = "item",
  id,
  initialParams,
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
}: ISingleHandlerProps<
  TData,
  TUpdateData,
  TResponse,
  TSingleExtraProps,
  TFormExtraProps
>) {
  const queryClient = useQueryClient();
  const { confirm, dialogProps } = useConfirm();

  const sinleStoreKey = storeKey + "-single";

  // Initialize store
  let store = useRegisteredStore<TSingleHandlerStore<TData>>(sinleStoreKey);
  if (!store) {
    store = useSingleHandlerStore<TData>(name, id, initialParams);
    registerStore<TSingleHandlerStore<TData>>(sinleStoreKey, store);
  }

  useEffect(() => {
    registerStore(sinleStoreKey, store);
    return () => deregisterStore(sinleStoreKey);
  }, [sinleStoreKey, store]);


  const { id: itemId, isDeleting } = useStore(store);

  const queryKey = [sinleStoreKey, itemId];
  const { data, error, isError, isLoading, isSuccess } = useQuery<TData, Error>({
    queryKey,
    queryFn: () => queryFn(itemId!),
    enabled: !!itemId,
  });

  useEffect(() => {
    console.log("🧠 Store ID changed:", isLoading);
  }, [isLoading]);

  useEffect(() => {
    store.getState().syncWithQuery({
      isLoading,
      error: isError ? error : null,
      response: isSuccess ? data : undefined,
      isSuccess,
    });
  }, [isLoading, isError, isSuccess]);

  const mutation = useMemo(() => {
    if (id && mutationFns?.updateFn) {
      return { fn: mutationFns.updateFn(id), type: "update" as const };
    } else if (mutationFns?.createFn) {
      return { fn: mutationFns.createFn, type: "create" as const };
    }
    return {
      fn: async () => { throw new Error("No mutation function available"); },
      type: "none" as const
    };
  }, [id, mutationFns])


  const { mutate: deleteItem } = useApiMutation(
    mutationFns?.deleteFn || (() => Promise.reject("No delete function")), {
    onMutate: () => {
      store.getState().syncWithQuery({
        isLoading: true,
        error: null,
        isSuccess: false
      });
    },

    onSuccess: () => {
      store.getState().syncWithQuery({
        isLoading: false,
        error: null,
        isSuccess: true,
        response: null
      });
      toast.success("Item deleted successfully!");
      mutationFns?.onSuccess?.("deleted")();
      queryClient.invalidateQueries({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      });
    },
    onError: (error: Error) => {
      store.getState().syncWithQuery({
        isLoading: false,
        error: error,
        isSuccess: false
      });
    }
  });

  const handleDeleteItem = useMemo(() => (
    (itemName: string, id: number) => {
      confirm(
        "Delete Item",
        `Are you sure you want to delete this ${itemName}?`,
        () => deleteItem(id),
        () => { },
        "destructive"
      );
    }
  ), [confirm, deleteItem]);

  useEffect(() => {

    if (isDeleting) {
      handleDeleteItem(name, id!);
    }

  }, [isDeleting]);


  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <>
        {SingleComponent && (
          <SingleComponent
            storeKey={storeKey}
            {...(singleProps as TSingleExtraProps)}
          />
        )}

        <FormHandler<TUpdateData, TResponse, TFormExtraProps>
          mutationFn={mutation.fn}
          FormComponent={FormComponent}
          initialValues={initialValues}
          validationMode={validationMode}
          validationSchema={validationSchema}
          onSuccess={onSuccess || (() => toast.success('Operation successful'))}
          onError={onError}
          formProps={formProps}
          storeKey={storeKey}
        />


        {dialogProps && <ConfirmDialog {...dialogProps} />}
      </>
    </ErrorBoundary>
  );
}
