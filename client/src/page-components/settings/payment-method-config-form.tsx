import { Button } from "@/components/ui/button";
import { TExtraComponentProps } from "@/@types/handler-types";
import { useInput } from "@/hooks/use-input";
import { z } from "zod";
import { ModalForm } from "@/components/form-ui/modal-form";
import { TFormHandlerStore, TListHandlerStore, useRegisteredStore } from "@/stores";
import { useStore } from "zustand";
import { TDefaultValue, TFieldConfig } from "@/@types/form/field.type";
import { FormHandler } from "@/handlers";
import { IPaymentMethod, TUpdatePaymentMethodData } from "@/@types/setting.type";
import { IMessageResponse } from "@/@types/api/response.type";
import { updatePaymentMethod } from "@/services/setting.api";

interface IPaymentMethodConfigFormModalProps extends TExtraComponentProps<any> {
  storeKey: string;
}

export default function PaymentMethodConfigFormModal({
  storeKey
}: IPaymentMethodConfigFormModalProps) {


  const listStoreKey = storeKey + "-list";

  const listStore = useRegisteredStore<TListHandlerStore<IPaymentMethod>>(listStoreKey);

  if (!listStore) {
    return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
  }

  const { response: data, itemAction, setItemAction } = useStore(listStore);

  const values = data?.find((item) => item.id === itemAction?.id);
  if (!values) {
    return null;
  }

  const ConfigSchema = values?.configSchema
    ? z.object(
      Object.keys(values.configSchema.properties || {}).reduce((acc, key) => {
        const prop = values.configSchema!.properties![key];
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
    : z.object({});

  function renderFields(): TFieldConfig[] {
    if (!values?.configSchema?.properties) return [];

    return Object.keys(values.configSchema.properties).map((key) => {
      const prop = values!.configSchema!.properties![key];

      const baseField: TFieldConfig = {
        id: key,
        name: key,
        label: prop.title || key,
        type: prop.type as any,
        required: prop.required || false,
        placeholder: prop.description || `Enter ${prop.title || key}`,
        disabled: false,
      };

      if (prop.type === 'select' && prop.enum) {
        return {
          ...baseField,
          type: 'select',
          options: prop.enum.map((option: string) => ({
            label: option,
            value: option,
          })),
        };
      }

      return baseField;
    });
  }

  const defaultValues = Object.keys(values?.configSchema?.properties || {}).reduce(
    (acc, key) => {
      acc[key] = { value: "" };
      return acc;
    },
    {} as Record<string, { value: any }>
  );

  const INITIAL_VALUES: TDefaultValue<any> = defaultValues;

  const handleCancel = () => {
    setItemAction(null);
  }


  return (
    <FormHandler<any, IMessageResponse>
      storeKey="paymentMethodConfigForm"
      mutationFn={(data: any) => updatePaymentMethod(values.id)({ config: data })}
      validationSchema={ConfigSchema}
      initialValues={INITIAL_VALUES}
      FormComponent={({ storeKey }: { storeKey: string }) => {

        const formStoreKey = storeKey + "-form";
        const formStore = useRegisteredStore<TFormHandlerStore<any, IMessageResponse>>(formStoreKey);

        if (!formStore) {
          return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
        }

        const { isSubmitting } = useStore(formStore);

        const { inputs } = useInput({
          fields: renderFields(),
        });

        return <ModalForm<any, IMessageResponse>
          title="Payment Method Configuration"
          description="Configure the settings for this payment method."
          open={itemAction?.action === "configurePaymentMethod"}
          onOpenChange={(open) => {
            if (!open)
              handleCancel();
          }}
          footerContent={
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="ml-2">
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </>
          }
          width="md"
          formStore={formStore}
        >
          {inputs}
        </ModalForm>
      }
      }
    />

  );
} 