import { useEffect } from "react";
import { toast } from "sonner";
import { TListHandlerStore, useRegisteredStore } from "@/stores";
import { IPaymentMethod } from "@/@types/setting.type";
import { useStore } from "zustand";
import { updatePaymentMethod } from "@/services/setting.api";
import { TExtraComponentProps } from "@/@types/handler-types";
import { useConfirm } from "@/hooks/use-confirm";
import { ConfirmDialog } from "@/components/layout-ui/app-alert-dialog";

interface IPaymentMethodToggleProps extends TExtraComponentProps<any> {
  storeKey: string;
}

export default function PaymentMethodEnabledToggle({
  storeKey,
}: IPaymentMethodToggleProps) {

  const listStoreKey = storeKey + "-list";

  const listStore = useRegisteredStore<TListHandlerStore<IPaymentMethod>>(listStoreKey);

  if (!listStore) {
    return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
  }

  const { response: data, itemAction, setItemAction } = useStore(listStore);
  const { confirm, dialogProps } = useConfirm();



  const handleToggle = async (id: number) => {
    try {
      const method = data?.find((item) => item.id === id);
      if (!method) {
        toast.error("Payment method not found");
        return;
      }

      await updatePaymentMethod(id)({
        isEnabled: !method.isEnabled,
      });
      toast.success("Payment method status updated successfully");
    } catch (error) {
      toast.error("Failed to update payment method status");
      console.error(error);
    } finally {
      setItemAction(null);
    }
  };


  useEffect(() => {

    if (!itemAction || itemAction.action !== "togglePaymentMethod")
      return;

    confirm(
      `Confirm ${itemAction.itemName}`,
      `Are you sure you want to delete this ${itemAction.itemName}?`,
      () => handleToggle(itemAction.id),
      () => { },
      "destructive"
    );
  }, [itemAction, setItemAction]);

  return <ConfirmDialog {...dialogProps} />
} 