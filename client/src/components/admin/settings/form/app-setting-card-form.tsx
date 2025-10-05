// External Libraries
import React, { ReactNode } from "react";

// Components
import { Form } from "@/components/form-ui/form";
import { Button } from "@/components/ui/button";

// Hooks
import { FormInputs, useInput } from "@/hooks/use-input";

// Types
import { TFieldConfigObject } from "@/@types/form/field-config.type";
import { TAppSettingData } from "@shared/types/settings.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";

// Stores
import { TFormHandlerStore } from "@/stores";
import { FormErrors } from "@/components/shared-ui/form-errors";
import { AppCard } from "@/components/layout-ui/app-card";
import { THandlerComponentProps } from "@/@types/handler-types";
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { UpdateAppSettingDto } from "@shared/dtos";

interface IAppSettingCardFormProps extends THandlerComponentProps<TFormHandlerStore<TAppSettingData, IMessageResponse>> {
}

const AppSettingCardForm = React.memo(function AppSettingCardForm({ storeKey, store }: IAppSettingCardFormProps) {
    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const isSubmitting = store(state => state.isSubmitting);

    const fields = dtoToFields(UpdateAppSettingDto, {}) as TFieldConfigObject<TAppSettingData>;

    const inputs = useInput<TAppSettingData>({
        fields,
        showRequiredAsterisk: false,
    }) as FormInputs<TAppSettingData>;

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
        </div>
    );

    return (
        <Form formStore={store}>
            <AppCard
                header={
                    <>
                        <h2 className="text-md font-semibold">Application Settings</h2>
                        <p className="text-sm text-muted-foreground">Configure general application preferences</p>
                    </>
                }
                footer={footerContent}
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {inputs.allowNotification}
                    </div>
                </div>
            </AppCard>
            <FormErrors />
        </Form>
    );
});

export default AppSettingCardForm;
