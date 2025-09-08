// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IPaymentMethod, TUpdatePaymentMethodData } from "@/@types/setting.type";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { PaymentMethodConfigFormModal } from "@/components/admin";

// Services
import { updatePaymentMethod } from "@/services/setting.api";


interface IPaymentMethodConfigFormProps extends TActionComponentProps<any> {
}

interface IPaymentMethodConfigFormExtraProps {
  properties: any,
  open: boolean,
  onClose: () => void,
}

export default function PaymentMethodConfigForm({
  storeKey
}: IPaymentMethodConfigFormProps) {

  const singleStoreKey = storeKey + "-single";
  const singleStore = useRegisteredStore<TSingleHandlerStore<IPaymentMethod[]>>(singleStoreKey);

  if (!singleStore) {
    return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
  }

  const { response: paymentMethods, action, setAction, id, isLoading } = singleStore(useShallow(state => ({
    action: state.action,
    id: state.id,
    response: state.response,
    isLoading: state.isLoading,
    setAction: state.setAction
  })));

  const paymentMethod = paymentMethods?.find(pm => pm.id === id);

  if (!paymentMethod)
    return <div>Payment Method not found</div>


  const properties = paymentMethod.configSchema?.properties;

  const ConfigSchema = z.object({
    config: paymentMethod.configSchema
      ? z.object(
        Object.keys(properties || {}).reduce((acc, key) => {
          const prop = properties![key];
          if (prop.type === 'string') {
            acc[key] = z.string().min(1, `${prop.title || key} is required`);
          } else if (prop.type === 'number') {
            acc[key] = z.number().min(1, `${prop.title || key} is required`);
          } else if (prop.type === 'boolean') {
            acc[key] = z.boolean();
          }
          return acc;
        }, {} as Record<string, any>)
      )
      : z.object({})
  });


  const defaultValues = {
    config: {
      value: Object.keys(properties || {}).reduce<Record<string, string>>(
        (acc, key) => {
          acc[key] = "";
          return acc;
        },
        {}
      )
    }
  };

  console.log(defaultValues);


  const initialValues: TDefaultValue<{ config: any }> = defaultValues;

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }



  return <>
    <FormHandler<TUpdatePaymentMethodData, IMessageResponse, IPaymentMethodConfigFormExtraProps>
      mutationFn={updatePaymentMethod(paymentMethod.id)}
      FormComponent={PaymentMethodConfigFormModal}
      storeKey={storeKey}
      initialValues={initialValues}
      validationSchema={ConfigSchema}
      validationMode={EVALIDATION_MODES.OnSubmit}
      formProps={{
        properties,
        open: !!action,
        onClose: () => setAction('none'),
      }}
    />

  </>

}
