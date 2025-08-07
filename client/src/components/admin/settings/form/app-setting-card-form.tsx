// External Libraries
import { ReactNode } from "react";

// Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import {  TAppSettingData } from "@/@types/setting.type";
import { IMessageResponse } from "@/@types/api/response.type";

// Stores
import { TFormHandlerStore, useRegisteredStore } from "@/stores";

interface IAppSettingCardFormProps {
    storeKey: string;
}

export default function AppSettingCardForm({ storeKey }: IAppSettingCardFormProps) {
    const formStoreKey = storeKey + "-form";

    // Move store calls to top level
    const formStore = useRegisteredStore<TFormHandlerStore<TAppSettingData, IMessageResponse>>(formStoreKey);

    // Handle missing stores after hooks are called
    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }


    const isSubmitting = formStore(state => state.isSubmitting);

    const fields: TFieldConfig[] = [
        // ─── General App Settings ──────────────
        {
            id: "allowNotification",
            name: "allowNotification",
            label: "Allow Notifications",
            type: "switch",
            required: false,
        },
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: false,
    });

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
        </div>
    );

    return (
        <CardForm
            title="Application Settings"
            description="Configure general application preferences"
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
