
// External Libraries
import { useShallow } from 'zustand/shallow';

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TTrainerClientData } from "@shared/types/trainer-clients.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";

// Layouts
import { TrainerClientAssignFormModal } from "@/components/admin";

// Services
import { assignTrainerToClient } from "@/services/trainer-client.api";

// Store
import { TSingleHandlerStore } from "@/stores";
import { ITrainerClientAssignFormExtraProps } from "@/components/admin/trainer-clients/form/trainer-client-assign-form-modal";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTrainerClientDto } from "@shared/dtos";
import { TUserExtraProps } from "../user";
import { Loader2 } from 'lucide-react';
import { strictDeepMerge } from '@/utils';
import { ITrainerClient } from '@shared/interfaces/trainer-clients.interface';


interface ITrainerClientAssignFormProps extends THandlerComponentProps<TSingleHandlerStore<ITrainerClient, TUserExtraProps>> {
}

export default function TrainerClientAssignForm({
    storeKey,
    store
}: ITrainerClientAssignFormProps) {


    const queryClient = useQueryClient();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction, reset } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction,
        reset: state.reset
    })));


    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }


    const trainerId =  0;
    const clientId =  0;

    const INITIAL_VALUES: TTrainerClientData = {
        trainer: { id: trainerId, email: "" },
        client: { id: clientId, email: "" },
    };

    const initialValues = strictDeepMerge<TTrainerClientData>(INITIAL_VALUES, response ?? {});

    const handleClose = () => {
        reset();
        setAction('none');
    };


    return (
        <FormHandler<TTrainerClientData, IMessageResponse, ITrainerClientAssignFormExtraProps>
            storeKey="assignTrainer"
            FormComponent={TrainerClientAssignFormModal}
            mutationFn={assignTrainerToClient}
            dto={CreateTrainerClientDto}
            initialValues={initialValues}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                handleClose();
            }}
            formProps={{
                trainerId,
                clientId,
                open: action === 'assignClient' || action === 'assignTrainer' || action === 'createOrUpdate',
                onClose: handleClose
            }}

        />

    );
}
