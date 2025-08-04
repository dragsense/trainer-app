// React & Hooks
import React, { useEffect, useMemo } from "react";

// Types
import {
  IActionComponent,
} from "@/@types/handler-types";
import { TQueryParams } from "@/@types/api/param.type";


// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useConfirm } from "@/hooks/use-confirm";

// External Libraries
import { toast } from "sonner";

// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";

// UI Components
import { ConfirmDialog } from "@/components/layout-ui/app-alert-dialog";
import { ActionComponentHandler } from "./action-handler";

// Stores
import { deregisterStore, registerStore, TSingleHandlerStore, useRegisteredStore, useSingleHandlerStore } from "@/stores";

// Hooks
import { useApiQuery } from "@/hooks/use-api-query";
import { useShallow } from "zustand/shallow";


export interface ISingleHandlerProps<
  IData,
  TSingleExtraProps,
> {
  storeKey: string;
  listStoreKey?: string;
  initialId?: number;
  name?: string;
  initialParams?: TQueryParams;
  queryFn: (id: number, queryParams: TQueryParams) => Promise<IData>;
  deleteFn?: (id: number) => Promise<void>;
  onDeleteSuccess?: () => void;
  SingleComponent: React.ComponentType<{ storeKey: string } & TSingleExtraProps>;
  actionComponents?: IActionComponent<TSingleExtraProps>[];
  singleProps?: TSingleExtraProps;
}

export function SingleHandler<
  IData,
  TSingleExtraProps = any,
>({
  name = "Item",
  initialParams = {},
  initialId = 0,
  queryFn,
  deleteFn,
  onDeleteSuccess,
  storeKey,
  SingleComponent,
  singleProps,
  actionComponents = []
}: ISingleHandlerProps<
  IData,
  TSingleExtraProps
>) {
  const singleStoreKey = storeKey + "-single";

  let store = useRegisteredStore<TSingleHandlerStore<IData>>(singleStoreKey);
  if (!store) {
    store = useSingleHandlerStore<IData>(name, initialId, initialParams);
    registerStore<TSingleHandlerStore<IData>>(singleStoreKey, store);
  }

  useEffect(() => {
    registerStore(singleStoreKey, store);
    return () => deregisterStore(singleStoreKey);
  }, [singleStoreKey, store]);


  const id = store((state) => state.id);

  const queryKey = [singleStoreKey, id];


  useApiQuery<IData>(
    queryKey,
    async (params) => {
      store.setState({ isLoading: true });
      try {
        const response = await queryFn(id, params);
        store.setState({
          isLoading: false,
          error: null,
          response,
          isSuccess: true,
        });
        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        store.setState({
          response: null,
          isLoading: false,
          error: err,
          isSuccess: false,

        });
        throw err;

      }
    },
    initialParams,
    {
      enabled: !!id,
    }
  );



  const internalActionComponents: IActionComponent<TSingleExtraProps>[] = useMemo(() => {
    if (!deleteFn) return actionComponents;

    return [
      ...actionComponents,
      {
        action: "delete",
        comp: ({ action, storeKey }) => {
          const { confirm, dialogProps } = useConfirm();

          const singleStoreKey = storeKey + "-single";
          const store = useRegisteredStore<TSingleHandlerStore<IData>>(singleStoreKey);

          if (!store) {
            return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
          }

          const { id, name, reset } = store(useShallow(state => ({
            id: state.id,
            name: state.name,
            reset: state.reset
          })));

          const { mutate: deleteItem } = useApiMutation(
            deleteFn,
            {
              onMutate: () => {
                store.getState().syncWithQuery({
                  isLoading: true,
                  error: null,
                  isSuccess: false,
                });
              },
              onSuccess: () => {
                store.getState().syncWithQuery({
                  isLoading: false,
                  error: null,
                  isSuccess: true,
                  response: null,
                });
                onDeleteSuccess?.();
                toast.success(`${name} deleted successfully!`);
              },
              onError: (error: Error) => {
                store.getState().syncWithQuery({
                  isLoading: false,
                  error,
                  isSuccess: false,
                });

                toast.error(`Failed to delete ${name}: ${error.message}`);
              },
            }
          );

          const handleDeleteItem = useMemo(
            () =>
              () =>
                confirm(
                  "Delete Item",
                  `Are you sure you want to delete this ${name}?`,
                  async () => {
                    await deleteItem(id);
                    reset();
                  },
                  () => { reset() },

                  "destructive"
                ),
            [deleteFn, id]
          );

          useEffect(() => {
            if (action === "delete") {
              handleDeleteItem();
            }
          }, [action, handleDeleteItem]);

          return <ConfirmDialog {...dialogProps} />;
        },
      },
    ];
  }, [actionComponents, deleteFn]);




  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <>
        {SingleComponent && (
          <SingleComponent
            storeKey={storeKey}
            {...(singleProps as TSingleExtraProps)}
          />
        )}

        <ActionComponentHandler<IData, TSingleExtraProps>
          extraComponents={internalActionComponents}
          storeKey={storeKey}
          listProps={singleProps as TSingleExtraProps}
        />

      </>
    </ErrorBoundary>
  );
}
