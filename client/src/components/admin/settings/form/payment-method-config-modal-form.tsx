// External Libraries

// Components
import { Button } from "@/components/ui/button";

// Custom Components
import { ModalForm } from "@/components/form-ui/modal-form";


// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TUpdatePaymentMethodData } from "@/@types/setting.type";
import { IMessageResponse } from "@/@types/api/response.type";

// Stores
import { TFormHandlerStore } from "@/stores";
import { Loader2 } from "lucide-react";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { THandlerComponentProps } from "@/@types/handler-types";
import { useShallow } from "zustand/shallow";


export interface IPaymentMethodConfigFormModalExtraProps {
    properties: any;
    open: boolean;
    onClose: () => void;
}

interface IPaymentMethodConfigFormModalProps extends THandlerComponentProps<TFormHandlerStore<TUpdatePaymentMethodData, IMessageResponse>> {

}

export default function PaymentMethodConfigFormModal({ storeKey, store }: IPaymentMethodConfigFormModalProps) {
    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }



    const { isSubmitting, extra } = store(useShallow(state => ({
        isSubmitting: state.isSubmitting,
        extra: state.extra
    })));

    const { properties, open, onClose } = extra;

    function renderFields(): TFieldConfig[] {
        if (!properties) return [];

        return Object.keys(properties).map((key) => {
            const prop = properties![key];

            const baseField: TFieldConfig = {
                id: key,
                name: `config.${key}`,
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

    const { inputs } = useInput({
        fields: renderFields(),
        showRequiredAsterisk: false,
    });

    const onOpenChange = (state: boolean) => {
        if (state === false) onClose();
    };

    const formButtons = (
        <div className="flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
            </Button>
        </div>
    );

    return (
        <ModalForm<TUpdatePaymentMethodData, IMessageResponse>
            title={`Payment Method Configurations`}
            description={`Configure payment method configuration.`}
            open={open}
            onOpenChange={onOpenChange}
            formStore={store}
            footerContent={formButtons}
            width="3xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {inputs}
                </div>
            </div>

            <FormErrors />
        </ModalForm>
    );
}
