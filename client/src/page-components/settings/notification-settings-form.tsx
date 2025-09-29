// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { INotificationSetting } from "@shared/interfaces/settings.interface";
import { TNotificationSettingData } from "@shared/types/settings.type";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { NotificationSettingCardForm } from "@/components/admin";

// Services
import { updateNotificationSettings } from "@/services/setting.api";
import { extractValues } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateNotificationSettingDto } from '@shared/dtos/settings-dtos/notification-setting.dto';

// Schema
 

interface INotificationSettingsFormProps extends THandlerComponentProps<TSingleHandlerStore<INotificationSetting, any>> {}

export default function NotificationSettingsForm({ storeKey, store }: INotificationSettingsFormProps) {
    const queryClient = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TNotificationSettingData> = {
        emailNotifications: { value: true },
        newUserNotifications: { value: true },
        userUpdateNotifications: { value: true },
        billingNotifications: { value: true },
        sessionNotifications: { value: true },
    };

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }


    const { response, isLoading } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
    })));

    const initialValues = useMemo(() => {
        return extractValues(response, INITIAL_VALUES);
    }, [response]);


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

    if (!response) {
        return <div>Notification settings not found</div>;
    }



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
            dto={UpdateNotificationSettingDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                // Refresh the notification settings data
               queryClient.invalidateQueries({ queryKey: [storeKey + "-single"] });
            }}
        />
    );
}