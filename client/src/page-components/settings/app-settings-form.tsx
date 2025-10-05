// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { THandlerComponentProps } from "@/@types/handler-types";
import { IAppSetting } from "@shared/interfaces/settings.interface";
import { TAppSettingData } from "@shared/types/settings.type";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import AppSettingCardForm from "@/components/admin/settings/form/app-setting-card-form";

// Services
import { updateAppSettings } from "@/services/setting.api";
import { strictDeepMerge } from "@/utils";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { UpdateAppSettingDto } from "@shared/dtos";


interface IAppSettingsFormProps extends THandlerComponentProps<TSingleHandlerStore<IAppSetting, any>> {}

export default function AppSettingsForm({ storeKey, store }: IAppSettingsFormProps) {
   
    const queryClient = useQueryClient();

    const INITIAL_VALUES: TAppSettingData = {
        allowNotification: true,
    };

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { response, isLoading } = store(useShallow(state => ({
        response: state.response,
        isLoading: state.isLoading,
    })));

    const initialValues = useMemo(() => {
        return strictDeepMerge<TAppSettingData>(INITIAL_VALUES, response ?? {});
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
            dto={UpdateAppSettingDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-single"] });
            }}
        />
    );
}