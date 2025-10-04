// External Libraries
import { ReactNode } from "react";

// Components
import { Form } from "@/components/form-ui/form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field-config.type";
import { TNotificationSettingData } from "@shared/types/settings.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";

// Stores
import { TFormHandlerStore } from "@/stores";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { AppCard } from "@/components/layout-ui/app-card";
import { THandlerComponentProps } from "@/@types/handler-types";

interface INotificationSettingCardFormProps extends THandlerComponentProps<TFormHandlerStore<TNotificationSettingData, IMessageResponse>> {
}

export default function NotificationSettingCardForm({ storeKey, store }: INotificationSettingCardFormProps) {
    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }


    const isSubmitting = store(state => state.isSubmitting);

    const fields: TFieldConfig<TNotificationSettingData>[] = [
        // ─── General Notifications ──────────────
        {
            id: "emailNotifications",
            name: "emailNotifications",
            label: "Email Notifications",
            type: "switch",
            required: false,
        },
        
        // ─── User Management Notifications ─────
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
        
        // ─── Business Notifications ─────
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
                {isSubmitting ? "Saving..." : "Save Notification Settings"}
            </Button>
        </div>
    );

    return (
        <Form formStore={store}>
        <AppCard
            header={
                <>
                    <h2 className="text-md font-semibold">Notification Settings</h2>
                    <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
                </>
            }
            footer={footerContent}
        >
            
                <div className="space-y-6">
                    {/* General Notifications Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">General Notifications</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {inputs.slice(0, 1)}
                                <p className="text-sm text-muted-foreground ml-6">
                                    Receive notifications via email for important updates and alerts
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* User Management Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">User Management</h3>
                        <div className="space-y-4">
                            {inputs.slice(1, 3).map((input, index) => (
                                <div key={index} className="space-y-2">
                                    {input}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Business Notifications Section */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Business Notifications</h3>
                        <div className="space-y-4">
                            {inputs.slice(3).map((input, index) => (
                                <div key={index} className="space-y-2">
                                    {input}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

           
        </AppCard>
        </Form>
    );
}