// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
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
import { strictDeepMerge } from "@/utils";

// Hooks
import { useAuthUser } from "@/hooks/use-auth-user";
import { CreateSessionDto, UpdateSessionDto } from "@shared/dtos";


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

    const action = store((state) => state.action);
    const response = store((state) => state.response);
    const isLoading = store((state) => state.isLoading);
    const extra = store((state) => state.extra);
    const setAction =  store.getState().setAction;
    const reset = store.getState().reset;

    const INITIAL_VALUES: TSessionData = {
        title: "",
        type: ESessionType.ONE_ON_ONE,
        dateTime: new Date().toISOString(),
        duration: 60,
        pricePerClient: 0,
        currency: EBillingCurrency.USD,
        paymentMethodType: EPaymentMethodType.CASH,
        description: "",
        location: "",
        requirePrepayment: true,
        cancellationDeadline: 24,
        trainer: {
            id: extra?.trainerId || trainerId,
            email: "" // Required by UserDto
        },
        clients: []
    };

    const initialValues = strictDeepMerge<TSessionData>(INITIAL_VALUES, response ?? {});


    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const handleClose = () => {
        reset();
        setAction('none');
    };

    const isEditing = !!response?.id;
    const mutationFn = isEditing ? updateSession(response.id) : createSession;
    const dto = isEditing ? UpdateSessionDto : CreateSessionDto;

    return <>
        <FormHandler<TSessionData, IMessageResponse, ISessionFormModalExtraProps>
            mutationFn={mutationFn}
            FormComponent={SessionFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={dto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={isEditing}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                handleClose();
            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
                trainerId: extra?.trainerId || trainerId
            }}
        />
    </>
}