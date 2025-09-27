// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TSessionData } from "@shared/types/session.type";
import { ISession } from "@shared/interfaces/session.interface";

import { EBillingCurrency } from "@shared/enums/billing.enum";
import { ESessionType } from "@shared/enums/session.enum";
import { EPaymentMethodType } from "@shared/enums/payment-method.enum";
import { EUserLevels, EUserRole } from "@shared/enums/user.enum";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { SessionFormModal, ISessionFormModalExtraProps } from "@/components/admin";

// Services
import { createSession, updateSession } from "@/services/session.api";
import { extractValues } from "@/utils";

// Hooks
import { useAuthUser } from "@/hooks/use-auth-user";
import { CreateSessionDto } from "@shared/dtos";


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
    const trainerId = user?.level === EUserLevels[EUserRole.TRAINER] ? user.id : 0;

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
        type: { value: ESessionType.ONE_ON_ONE },
        dateTime: { value: new Date() },
        duration: { value: 60 },
        pricePerClient: { value: 0 },
        currency: { value: EBillingCurrency.USD },
        paymentMethodType: { value: EPaymentMethodType.CASH },
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
            value: [{
                isNested: true,
                value: {
                    id: { value: 0 }
                }
            }]
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
            dto={CreateSessionDto}
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