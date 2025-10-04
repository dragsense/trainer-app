
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { useNavigate } from "react-router-dom";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { TDefaultValue } from "@/@types/form/field-config.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { IStripeConnectCreateResponse, IStripeConnectStatus, TCreateStripeConnectData } from "@/@types/setting.type";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { StripeConnectFormModalForm } from "@/components/admin";

// Services
import { createStripeConnect } from "@/services/setting.api";




// Schema
export const StripeConnectsSchema = z.object({
    type: z.enum(['express', 'standard']),
    country: z.string().min(2).max(2),
});


interface IStripeConnectFormProps extends THandlerComponentProps<TSingleHandlerStore<IStripeConnectStatus, any>> {
}


interface IStripeConnectFormExtraProps {
    open: boolean,
    onClose: () => void,
}

export default function StripeConnectForm({
    storeKey,
    store
}: IStripeConnectFormProps) {

    const navigate = useNavigate();

    const INITIAL_VALUES: TDefaultValue<TCreateStripeConnectData> = {
        type: { value: "express" },
        country: { value: "US" },
    };

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, reset } = store(useShallow(state => ({
        action: state.action,
        reset: state.reset
    })));


    const initialValues = INITIAL_VALUES;

    return <>
        <FormHandler<TCreateStripeConnectData, IStripeConnectCreateResponse, IStripeConnectFormExtraProps>
            mutationFn={createStripeConnect}
            onSuccess={(response) => {
                if (response?.data?.onboardingUrl) {
                    const onboardingUrl = response.data.onboardingUrl;
                    window.location.href = onboardingUrl;

                }
            }}
            FormComponent={StripeConnectFormModalForm}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={StripeConnectsSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            formProps={{
                open: action === 'connectStripe',
                onClose: () => reset()
            }}
        />

    </>

}
