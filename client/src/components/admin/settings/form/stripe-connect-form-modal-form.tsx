// External Libraries
import { ReactNode } from "react";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field-config.type";
import { IStripeConnectCreateResponse, TCreateStripeConnectData } from "@/@types/setting.type";

// Stores
import { TFormHandlerStore } from "@/stores";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { THandlerComponentProps } from "@/@types/handler-types";


export interface IStripeConnectFormModalFormExtraProps {
    open: boolean;
    onClose: () => void;
}

interface IStripeConnectFormModalFormProps extends THandlerComponentProps<TFormHandlerStore<TCreateStripeConnectData, IStripeConnectCreateResponse>> {

}

export default function StripeConnectFormModalForm({
    storeKey,
   store
}: IStripeConnectFormModalFormProps) {
    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }



    const isSubmitting = store(state => state.isSubmitting);
    const extra = store(state => state.extra);
    const { open, onClose } = extra;

    const fields: TFieldConfig[] = [
        {
            id: "type",
            name: "type",
            label: "Stripe Account Type",
            type: "select",
            required: true,
            options: [
                { label: "Express", value: "express" },
                { label: "Standard", value: "standard" },
            ],
        },

        {
            id: "country",
            name: "country",
            label: "Country",
            type: "select",
            required: true,
            options: [
                { label: "US", value: "US" },
                { label: "Dubai", value: "dubai" },
            ],
        },
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: false,
    });

    const onOpenChange = (state: boolean) => {
        if (state === false) onClose();
    };

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
        </div>
    );

    return (
        <ModalForm
            title={`Connect with Stripe`}
            description={`Configure your Stripe account.`}
            open={open}
            onOpenChange={onOpenChange}
            formStore={store}
            footerContent={footerContent}
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
