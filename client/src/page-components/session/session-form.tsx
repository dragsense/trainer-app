
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { ISession, TSessionData } from "@/@types/session.type";
import { BillingCurrency } from "#/modules/v1/billings/enums/billing.enum";
import { SessionType } from "#/modules/v1/sessions/enums/session.enum";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { SessionFormModal } from "@/components/admin";

// Services
import { createSession, updateSession } from "@/services/session.api";

// Hooks
import { useAuthUser } from "@/hooks/use-auth-user";




// Schema
export const SessionSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    type: z.nativeEnum(SessionType),
    trainerId: z.number().min(1, "Trainer is required"),
    clientIds: z.array(z.number()).min(1, "Session is required"),
    dateTime: z.date().min(new Date(), "Start date must be in the future"),
    duration: z.number().min(15, "Duration must be at least 15 minutes"),
    pricePerClient: z.number().min(0, "Price must be positive"),
    currency: z.nativeEnum(BillingCurrency).optional(),
    paymentMethodType: z.nativeEnum(PaymentMethodType),

    description: z.string().optional(),
    location: z.string().optional(),
    maxParticipants: z.number().optional(),
    requirePrepayment: z.boolean().default(true),
    cancellationDeadline: z.number().default(24),
});


interface ISessionFormProps extends TActionComponentProps<any> {
}


interface ISessionFormExtraProps {
    open: boolean,
    onClose: () => void,
    isEditing?: boolean,
    trainerId?: number
}

export default function SessionForm({
    storeKey
}: ISessionFormProps) {

    const { user } = useAuthUser();


    const trainerId = user?.level === UserLevels[UserRole.TRAINER] ? user.id : 0;

    const querySession = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TSessionData> = {
        title: { value: "" },
        type: { value: SessionType.ONE_ON_ONE },
        trainerId: { value: trainerId },
        clientIds: { value: [] },
        dateTime: { value: new Date() },
        duration: { value: 60 },
        pricePerClient: { value: 0 },
        currency: { value: BillingCurrency.USD },
        paymentMethodType: { value: PaymentMethodType.CASH },

        description: { value: "" },
        location: { value: "" },
        maxParticipants: { value: 1 },
        requirePrepayment: { value: true },
        cancellationDeadline: { value: 24 },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<ISession>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, reset } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        reset: state.reset
    })));

    const isEditing = !!response;

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        const flatResponse = {
            ...(response || {}),
            ...(response?.trainer ? { trainerId: response.trainer.id } : {}),
            ...(response?.clients ? { clientIds: response.clients.map(id => id) } : {}),

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
        <FormHandler<TSessionData, IMessageResponse, ISessionFormExtraProps>
            mutationFn={isEditing ? updateSession(response.id) : createSession}
            FormComponent={SessionFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={SessionSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                querySession.invalidateQueries({ queryKey: [storeKey + "-list"] });
            }}
            formProps={{
                open: !!action,
                onClose: reset,
                isEditing,
                trainerId
            }}
        />

    </>

}
