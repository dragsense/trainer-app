// External Libraries
import { ReactNode } from "react";

// Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { IPaymentMethod } from "@/@types/setting.type";

// Stores
import { useStore } from "zustand";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface IPaymentMethodCardFormProps {
    storeKey: string;
}

export default function PaymentMethodCardForm({ storeKey }: IPaymentMethodCardFormProps) {
    const formStoreKey = storeKey + "-form";
    const singleStoreKey = storeKey + "-single";

    // Move store calls to top level
    const formStore = useRegisteredStore<TFormHandlerStore<Partial<IPaymentMethod>, IPaymentMethod>>(formStoreKey);
    const singleStore = useRegisteredStore<TSingleHandlerStore<IPaymentMethod>>(singleStoreKey);

    // Handle missing stores after hooks are called
    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { isSubmitting } = useStore(formStore);

    const fields: TFieldConfig[] = [
        // ─── Payment Method Details ──────────────
        {
            id: "name",
            name: "name",
            label: "Payment Method Name",
            placeholder: "e.g., Stripe, PayPal, Bank Transfer",
            type: "text",
            required: true,
        },
        {
            id: "isEnabled",
            name: "isEnabled",
            label: "Enable Payment Method",
            type: "switch",
            required: false,
        },
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: true,
    });

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Payment Method"}
            </Button>
        </div>
    );

    return (
        <CardForm
            title="Payment Method Configuration"
            description="Configure available payment methods for your business"
            footerContent={footerContent}
            formStore={formStore}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {inputs}
                </div>
            </div>
        </CardForm>
    );
}
