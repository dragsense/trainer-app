// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { ISession, TSessionData } from "@/@types/session.type";
import { BillingCurrency } from "#/modules/v1/billings/enums/billing.enum";
import { SessionType } from "#/modules/v1/sessions/enums/session.enum";
import { PaymentMethodType } from "#/modules/v1/settings/payment-methods/enums/payment-method-type.enum";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { SessionFormModal, ISessionFormModalExtraProps } from "@/components/admin";

// Services
import { createSession, updateSession } from "@/services/session.api";
import { extractValues } from "@/utils";

// Hooks
import { useAuthUser } from "@/hooks/use-auth-user";

const TrainerSchema = z.object({
    id: z.number({
        message: "Trainer is required",
    }),
});

const ClientsSchema = z.object({
    ids: z.array(z.number()).min(1, {
        message: "At least one client is required",
    }),
});

// Schema
export const SessionSchema = z.object({
    title: z.string().min(2, {
        message: "Title must be at least 2 characters",
    }),
    type: z.nativeEnum(SessionType, {
        errorMap: () => ({ message: "Session type is required" }),
    }),
    dateTime: z.date({
        message: "Date and time is required",
    }),
    duration: z.number().min(15, {
        message: "Duration must be at least 15 minutes",
    }),
    pricePerClient: z.number().min(0, {
        message: "Price must be a non-negative number",
    }),
    currency: z.nativeEnum(BillingCurrency).optional(),
    paymentMethodType: z.nativeEnum(PaymentMethodType, {
        errorMap: () => ({ message: "Payment method is required" }),
    }),
    description: z.string().optional(),
    location: z.string().optional(),
    requirePrepayment: z.boolean().optional(),
    cancellationDeadline: z.number().min(1).optional(),
    trainer: TrainerSchema,
    clients: ClientsSchema,
});

export type TSessionExtraProps = {
    trainerId?: number;
}

interface ISessionFormProps extends THandlerComponentProps<TSingleHandlerStore<ISession, TSessionExtraProps>> {
}

export default function SessionForm({
    storeKey,
    store,
}: ISessionFormProps) {

    const { user } = useAuthUser();
    const trainerId = user?.level === UserLevels[UserRole.TRAINER] ? user.id : 0;

    const queryClient = useQueryClient();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction, extra } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        extra: state.extra,
        setAction: state.setAction
    })));

    const INITIAL_VALUES: TDefaultValue<TSessionData> = {
        title: { value: "" },
        type: { value: SessionType.ONE_ON_ONE },
        dateTime: { value: new Date() },
        duration: { value: 60 },
        pricePerClient: { value: 0 },
        currency: { value: BillingCurrency.USD },
        paymentMethodType: { value: PaymentMethodType.CASH },
        description: { value: "" },
        location: { value: "" },
        requirePrepayment: { value: true },
        cancellationDeadline: { value: 24 },
        trainer: {
            isNested: true,
            value: {
                id: { value: extra?.trainerId || trainerId }
            }
        },
        clients: {
            isNested: true,
            value: {
                ids: { value: [] }
            }
        }
    };

    const initialValues = useMemo(() => {
        return extractValues(response, INITIAL_VALUES);
    }, [response]);

    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const handleClose = () => {
        setAction('none');
    };

    return <>
        <FormHandler<TSessionData, IMessageResponse, ISessionFormModalExtraProps>
            mutationFn={response?.id ? updateSession(response.id) : createSession}
            FormComponent={SessionFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={SessionSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
                isEditing: response?.id ? true : false,
                trainerId: extra?.trainerId || trainerId
            }}
        />
    </>
}