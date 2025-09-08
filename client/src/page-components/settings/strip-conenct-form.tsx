
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { useNavigate } from "react-router-dom";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IStripeConnectCreateResponse, TCreateStripeConnectData } from "@/@types/setting.type";

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


interface IStripeConnectFormProps extends TActionComponentProps<any> {
}


interface IStripeConnectFormExtraProps {
    open: boolean,
    onClose: () => void,
}

export default function StripeConnectForm({
    storeKey
}: IStripeConnectFormProps) {

    const navigate = useNavigate();

    const INITIAL_VALUES: TDefaultValue<TCreateStripeConnectData> = {
        type: { value: "express" },
        country: { value: "US" },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<null>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, reset } = singleStore(useShallow(state => ({
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
                open: action === "connectStripe",
                onClose: () => reset()
            }}
        />

    </>

}
