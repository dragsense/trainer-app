// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { TActionComponentProps } from "@/@types/handler-types";
import { IAppSetting, TAppSettingData } from "@/@types/setting.type";

// Store
import { TSingleHandlerStore, TFormHandlerStore, useRegisteredStore } from "@/stores";

// Components
import AppSettingCardForm from "@/components/admin/settings/form/app-setting-card-form";

// Services
import { updateAppSettings } from "@/services/setting.api";

// Schema
export const AppSettingsSchema = z.object({
    allowNotification: z.boolean().optional(),
});

interface IAppSettingsFormProps extends TActionComponentProps<any> {}

export default function AppSettingsForm({ storeKey }: IAppSettingsFormProps) {
    const INITIAL_VALUES: TDefaultValue<TAppSettingData> = {
        allowNotification: { value: true },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IAppSetting>>(singleStoreKey);

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
                    <p className="text-muted-foreground">Loading app settings...</p>
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
                    <p className="text-muted-foreground">Loading app settings...</p>
                </div>
            </div>
        );
    }

    return (
        <FormHandler<TAppSettingData, IMessageResponse>
            mutationFn={updateAppSettings}
            FormComponent={AppSettingCardForm}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={AppSettingsSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                // Refresh the app settings data
                singleStore.getState().refetch();
            }}
        />
    );
}