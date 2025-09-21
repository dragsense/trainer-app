// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { TActionComponentProps, THandlerComponentProps } from "@/@types/handler-types";
import { IAppSetting, TAppSettingData } from "@/@types/setting.type";

// Store
import { TSingleHandlerStore, TFormHandlerStore, useRegisteredStore } from "@/stores";

// Components
import AppSettingCardForm from "@/components/admin/settings/form/app-setting-card-form";

// Services
import { updateAppSettings } from "@/services/setting.api";
import { useMemo } from "react";
import { extractValues } from "@/utils";
import { FormHandler } from "@/handlers";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Schema
export const AppSettingsSchema = z.object({
    allowNotification: z.boolean().optional(),
});

interface IAppSettingsFormProps extends THandlerComponentProps<TSingleHandlerStore<IAppSetting, any>> {}

export default function AppSettingsForm({ storeKey, store }: IAppSettingsFormProps) {
   
    const queryClient = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TAppSettingData> = {
        allowNotification: { value: true },
    };

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response, isLoading } = store(useShallow(state => ({
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
                    <p className="text-muted-foreground">Loading app settings...</p>
                </div>
            </div>
        );
    }



    if (!response) {
        return (
          <div>App settings not found</div>
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
                queryClient.invalidateQueries({ queryKey: [storeKey + "-single"] });
            }}
        />
    );
}