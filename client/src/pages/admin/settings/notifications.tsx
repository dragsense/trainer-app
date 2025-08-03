// External Libraries
import { z } from "zod";

// Types
import { INotificationSetting, TNotificationSettingData } from "@/@types/setting.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { SingleHandler } from "@/handlers";

// Custom UI Components
import { NotificationCardForm } from "@/components/admin/settings";

// API
import { fetchNotificationSettings, updateNotificationSettings } from "@/services/setting.api";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Schema
export const NotificationSchema = z.object({
    emailNotifications: z.boolean().optional(),
    newUserNotifications: z.boolean().optional(),
    userUpdateNotifications: z.boolean().optional(),
    invoiceNotifications: z.boolean().optional(),
    billingNotifications: z.boolean().optional(),
    sessionNotifications: z.boolean().optional(),
    chatNotifications: z.boolean().optional(),
});

export default function NotificationsPage() {
    const NOTIFICATION_INITIAL_VALUES: TDefaultValue<Partial<INotificationSetting>> = {
        emailNotifications: { value: true },
        newUserNotifications: { value: true },
        userUpdateNotifications: { value: true },
        billingNotifications: { value: true },
        sessionNotifications: { value: true },
    };

    return ( <SingleHandler<INotificationSetting, TNotificationSettingData, IMessageResponse>
                queryFn={fetchNotificationSettings}
                storeKey="notificationSettings"
                mutationFns={{
                    updateFn: () => updateNotificationSettings
                }}
                id={1}
                FormComponent={NotificationCardForm}
                validationSchema={NotificationSchema}
                initialValues={NOTIFICATION_INITIAL_VALUES}
                validationMode={EVALIDATION_MODES.OnChange}
            />
    );
}
