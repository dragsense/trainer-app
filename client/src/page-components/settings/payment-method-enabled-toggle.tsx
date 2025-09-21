import { useEffect } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

// Types
import { IPaymentMethod } from "@/@types/setting.type";
import { THandlerComponentProps } from "@/@types/handler-types";

// Components
import { ConfirmDialog } from "@/components/layout-ui/app-alert-dialog";

// Hooks
import { useConfirm } from "@/hooks/use-confirm";

// Stores
import {  TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Services
import { updatePaymentMethod } from "@/services/setting.api";


interface IPaymentMethodToggleProps extends THandlerComponentProps<TSingleHandlerStore<IPaymentMethod[], any>> {
}

export default function PaymentMethodEnabledToggle({
  storeKey,
  store
}: IPaymentMethodToggleProps) {

  if (!store) {
    return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
  }


  const { response: paymentMethods, id, setAction } = store(useShallow(state => ({
    action: state.action,
    id: state.id,
    response: state.response,
    isLoading: state.isLoading,
    setAction: state.setAction
  })));

  const paymentMethod = paymentMethods?.find((pm: IPaymentMethod) => pm.id === id);


  const { confirm, dialogProps } = useConfirm();

  const handleToggle = async (id: number) => {
    try {
      if (!paymentMethod) {
        toast.error("Payment method not found");
        return;
      }

      await updatePaymentMethod(id)({
        isEnabled: !paymentMethod.isEnabled,
      });
      toast.success("Payment method status updated successfully");
    } catch (error) {
      toast.error("Failed to update payment method status");
      console.error(error);
    } finally {
      setAction('none');
    }
  };


  useEffect(() => {
    if (id && paymentMethod) {
      confirm(
        `Confirm status for "${paymentMethod.name}"`,
        `Are you sure you want to ${paymentMethod.isEnabled ? "disable" : "enable"} the payment method "${paymentMethod.name}"?`,
        () => handleToggle(id),
        () => { },
        "destructive"
      );
    }
  }, [id, paymentMethod]);

  return <ConfirmDialog {...dialogProps} />
} 