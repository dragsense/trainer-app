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
import { INotificationSetting, TNotificationSettingData } from "@/@types/setting.type";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { NotificationSettingCardForm } from "@/components/admin";

// Services
import { updateNotificationSettings } from "@/services/setting.api";

// Schema
export const NotificationSettingsSchema = z.object({
    emailNotifications: z.boolean().optional(),
    newUserNotifications: z.boolean().optional(),
    userUpdateNotifications: z.boolean().optional(),
    billingNotifications: z.boolean().optional(),
    sessionNotifications: z.boolean().optional(),
});

interface INotificationSettingsFormProps extends TActionComponentProps<any> {}

export default function NotificationSettingsForm({ storeKey }: INotificationSettingsFormProps) {
    const INITIAL_VALUES: TDefaultValue<TNotificationSettingData> = {
        emailNotifications: { value: true },
        newUserNotifications: { value: true },
        userUpdateNotifications: { value: true },
        billingNotifications: { value: true },
        sessionNotifications: { value: true },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<INotificationSetting>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { response, isLoading } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
    })));

    if (!response) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading notification settings...</p>
                </div>
            </div>
        );
    }

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        const updatedValues = {
            ...INITIAL_VALUES,
            ...Object.fromEntries(
                Object.entries(INITIAL_VALUES).map(([key, original]) => {
                    const newValue = (response as any)[key];
                    return [
                        key,
                        {
                            ...original,
                            value: newValue !== undefined ? newValue : original.value,
                        },
                    ];
                })
            ),
        };

        return updatedValues;
    };

    const initialValues = getInitialValues();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading notification settings...</p>
                </div>
            </div>
        );
    }

    return (
        <FormHandler<TNotificationSettingData, IMessageResponse>
            mutationFn={updateNotificationSettings}
            FormComponent={NotificationSettingCardForm}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={NotificationSettingsSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                // Refresh the notification settings data
                singleStore.getState().refetch();
            }}
        />
    );
}