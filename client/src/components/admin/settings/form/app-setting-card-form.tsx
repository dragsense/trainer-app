// External Libraries
import { ReactNode } from "react";

// Components
import { Form } from "@/components/form-ui/form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TAppSettingData } from "@/@types/setting.type";
import { IMessageResponse } from "@/@types/api/response.type";

// Stores
import { TFormHandlerStore, useRegisteredStore } from "@/stores";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { AppCard } from "@/components/layout-ui/app-card";

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
        <AppCard
            header={
                <>
                    <h2 className="text-md font-semibold">Application Settings</h2>
                    <p className="text-sm text-muted-foreground">Configure general application preferences</p>
                </>
            }
            footer={footerContent}
        >
            <Form
                formStore={formStore}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {inputs}
                    </div>
                </div>

                <FormErrors />
            </Form>
        </AppCard>
    );
}
