
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
import { IAppSetting, TAppSettingData } from "@/@types/setting.type";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { AppSettingCardForm } from "@/components/admin";

// Services
import { updateAppSettings } from "@/services/setting.api";




// Schema
export const AppSettingsSchema = z.object({
    allowNotification: z.boolean().optional(),

});


interface IAppSettingsFormProps extends TActionComponentProps<any> {
}


interface IAppSettingsFormExtraProps {
}

export default function AppSettingsForm({
    storeKey
}: IAppSettingsFormProps) {


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

    if (!response)
        return <div>AppSettings not found</div>

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        const flatResponse = {
            ...(response || {})
        };


        const updatedValues = {
            ...INITIAL_VALUES,
            ...Object.fromEntries(
                Object.entries(INITIAL_VALUES).map(([key, original]) => {
                    const newValue = (flatResponse as any)[key];
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
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }



    return <>
        <FormHandler<TAppSettingData, IMessageResponse, IAppSettingsFormExtraProps>
            mutationFn={updateAppSettings}
            FormComponent={AppSettingCardForm}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={AppSettingsSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
        />

    </>

}
