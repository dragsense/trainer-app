// External Libraries
import { ReactNode } from "react";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { IStripeConnectCreateResponse, TCreateStripeConnectData } from "@/@types/setting.type";

// Stores
import { TFormHandlerStore, useRegisteredStore } from "@/stores";

interface IStripeConnectFormModalFormProps {
    storeKey: string;
    open: boolean;
    onClose: () => void;
}

export default function StripeConnectFormModalForm({
    storeKey,
    open,
    onClose
}: IStripeConnectFormModalFormProps) {
    const formStoreKey = storeKey + "-form";

    // Move store calls to top level
    const formStore = useRegisteredStore<TFormHandlerStore<TCreateStripeConnectData, IStripeConnectCreateResponse>>(formStoreKey);

    // Handle missing stores after hooks are called
    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }


    const isSubmitting = formStore(state => state.isSubmitting);

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
            formStore={formStore}
            footerContent={footerContent}
            width="3xl"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {inputs}
                </div>
            </div>
        </ModalForm>
    );
}
