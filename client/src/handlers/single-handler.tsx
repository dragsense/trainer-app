// React & Hooks
import React, { useEffect, useState } from "react";

// Types
import { ListParamsWithId } from "@/@types/api/param.type";
import { ItemActionProps, IMessageResponse } from "@/@types/general.type";
import {
  IFormBaseProps,
  ISingleBaseProps,
  MutationFns,
} from "@/@types/handler-types";

// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiQuery } from "@/hooks/use-api-query";
import { useConfirm } from "@/hooks/use-confirm";

// External Libraries
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Handlers
import { FormHandler } from "./form-handler";

// UI Components
import { ConfirmDialog } from "@/components/layout-ui/app-alert-dialog";

export type TSingleFormExtraProps<TData> = {
  open: boolean;
  closeForm: () => void;
  values: TData | null;
  isEditMode: boolean;
};

interface SingleHandlerProps<
  TData,
  TUpdateData,
  TResponse,
  TSingleExtraProps,
  TFormExtraProps
> {
  queryKey: string | any[];
  queryFn: (params: ListParamsWithId) => Promise<TData>;
  params?: ListParamsWithId;
  SingleComponent?: React.ComponentType<
    ISingleBaseProps<TData> & TSingleExtraProps
  >;
  FormComponent?: React.ComponentType<
    IFormBaseProps<TUpdateData, TResponse> &
      TFormExtraProps &
      TSingleFormExtraProps<TData>
  >;
  itemAction?: ItemActionProps | null;
  mutationFns?: MutationFns<TUpdateData, TResponse>;
  singleProps?: TSingleExtraProps;
  formProps?: TFormExtraProps;
}

export function SingleHandler<
  TData,
  TUpdateData = any,
  TResponse = any,
  TSingleExtraProps = any,
  TFormExtraProps = any
>({
  queryKey,
  queryFn,
  mutationFns,
  params = { id: 0 },
  SingleComponent,
  FormComponent,
  singleProps,
  itemAction,
  formProps,
}: SingleHandlerProps<
  TData,
  TUpdateData,
  TResponse,
  TSingleExtraProps,
  TFormExtraProps
>) {
  const queryClient = useQueryClient();
  const { confirm, dialogProps } = useConfirm();
  const [openSingle, setOpenSingle] = useState<boolean>(false);
  const [openForm, setOpenForm] = useState<boolean>(false);

  const { data, isLoading, error } = useApiQuery<TData, ListParamsWithId>(
    queryKey,
    queryFn,
    params
  );

  const mutationFn =
    params.id && mutationFns?.updateFn
      ? {
          fn: mutationFns.updateFn(params),
          s: mutationFns.onSuccess?.("updated"),
        }
      : mutationFns?.createFn
      ? {
          fn: mutationFns.createFn,
          s: mutationFns.onSuccess?.("created"),
        }
      : null;

  const deleteMutation = mutationFns?.deleteFn
    ? useApiMutation(mutationFns.deleteFn, {
        onSuccess: () => {
          mutationFns.onSuccess?.("deleted")();
          setTimeout(() => {
            toast.success("Deleted successfully!");
          }, 300);
        },
        onError: (error) => {
          setTimeout(() => {
            toast.success(error.message || "Deleted successfully!");
          }, 100);
        },
      })
    : null;

  const onMutationSuccess = (response: unknown) => {
    queryClient.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });

    if (mutationFn?.s) {
      mutationFn.s(response as TResponse | IMessageResponse);
    }


    closeSingleForm();
  };

  const handleDeleteItem = (itemName: string, id: number) => {
    confirm(
      `Delete ${itemName}`,
      `Are you sure you want to delete this ${itemName}?`,
      () => deleteMutation?.mutate(id),
      () => {},
      "destructive"
    );
  };

  const closeSingleForm = () => {
    setOpenForm(false);
  };

  const onItemAction = ({ itemName, action, id, extraAction }: ItemActionProps) => {

    if(extraAction)
      return;

    switch (action) {
      case "delete":
        handleDeleteItem(itemName, id);
        break;
      case "create":
      case "edit":
        setOpenForm(true);
        break;
      case "single":
        setOpenSingle(true);
        break;
      default:
        setOpenForm(false);
        setOpenSingle(false);
        break;
    }
  };

  useEffect(() => {
    if (itemAction) onItemAction(itemAction);
  }, [itemAction]);

  return (
    <>
      {SingleComponent && (
        <SingleComponent
          data={data || null}
          loading={isLoading}
          error={error?.message || null}
          onItemAction={onItemAction}
          open={openSingle}
          {...(singleProps as TSingleExtraProps)}
        />
      )}

      {FormComponent && (
        <FormHandler<
          TUpdateData,
          TResponse,
          TFormExtraProps & TSingleFormExtraProps<TData>
        >
          mutationFn={
            mutationFn
              ? mutationFn.fn
              : () => Promise.reject("No mutation function available")
          }
          FormComponent={FormComponent}
          formProps={{
            ...({
              open: openForm,
              closeForm: closeSingleForm,
              values: data || null,
              isEditMode: !!params.id,
            } as TSingleFormExtraProps<TData>),
            ...(formProps as TFormExtraProps),
          }}
          onSuccess={onMutationSuccess}
        />
      )}

      <ConfirmDialog {...dialogProps} />
    </>
  );
}
