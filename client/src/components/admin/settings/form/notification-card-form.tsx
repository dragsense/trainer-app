// External Libraries
import { ReactNode } from "react";

// Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { INotificationSetting } from "@/@types/setting.type";

// Stores
import { useStore } from "zustand";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";

interface INotificationCardFormProps {
    storeKey: string;
}

export default function NotificationCardForm({ storeKey }: INotificationCardFormProps) {
    const formStoreKey = storeKey + "-form";
    const singleStoreKey = storeKey + "-single";

    // Move store calls to top level
    const formStore = useRegisteredStore<TFormHandlerStore<Partial<INotificationSetting>, INotificationSetting>>(formStoreKey);
    const singleStore = useRegisteredStore<TSingleHandlerStore<INotificationSetting>>(singleStoreKey);

    // Handle missing stores after hooks are called
    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { isSubmitting } = useStore(formStore);

    const fields: TFieldConfig[] = [
        {
            id: "emailNotifications",
            name: "emailNotifications",
            label: "Email Notifications",
            type: "switch",
            required: false,
        },
        {
            id: "newUserNotifications",
            name: "newUserNotifications",
            label: "New User Notifications",
            type: "switch",
            required: false,
        },
        {
            id: "userUpdateNotifications",
            name: "userUpdateNotifications",
            label: "User Update Notifications",
            type: "switch",
            required: false,
        },
        {
            id: "billingNotifications",
            name: "billingNotifications",
            label: "Billing Notifications",
            type: "switch",
            required: false,
        },
        {
            id: "sessionNotifications",
            name: "sessionNotifications",
            label: "Session Notifications",
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
                {isSubmitting ? "Saving..." : "Save Preferences"}
            </Button>
        </div>
    );

    return (
        <CardForm
            title="Notification Preferences"
            description="Configure how and when you want to receive notifications"
            footerContent={footerContent}
            formStore={formStore}
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        {inputs[0]}
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                            Receive notifications via email for important updates and alerts
                        </p>
                    </div>

                    <div className="space-y-3">
                        {inputs[1]}
                     
                    </div>

                    <div className="space-y-3">
                        {inputs[2]}
                    
                    </div>

                    <div className="space-y-3">
                        {inputs[3]}
                     
                    </div>

                    <div className="space-y-3">
                        {inputs[4]}
                      
                    </div>
                </div>
            </div>
        </CardForm>
    );
}
