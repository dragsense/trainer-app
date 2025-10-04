
// External Libraries
import { useShallow } from 'zustand/shallow';

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TDefaultValue } from "@/@types/form/field-config.type";
import { TTrainerClientData } from "@shared/types/trainer-clients.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";

// Layouts
import { TrainerClientAssignFormModal } from "@/components/admin";

// Services
import { assignTrainerToClient } from "@/services/trainer-client.api";

// Store
import { TSingleHandlerStore } from "@/stores";
import { IUser } from "@shared/interfaces/user.interface";
import { ITrainerClientAssignFormExtraProps } from "@/components/admin/trainer-clients/form/trainer-client-assign-form-modal";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTrainerClientDto } from "@shared/dtos";
import { TUserExtraProps } from "../user";


interface ITrainerClientAssignFormProps extends THandlerComponentProps<TSingleHandlerStore<IUser, TUserExtraProps>> {
}

export default function TrainerClientAssignForm({
    storeKey,
    store
}: ITrainerClientAssignFormProps) {


    const queryClient = useQueryClient();

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { id, action, setAction } = store(useShallow(state => ({
        id: state.id,
        action: state.action,
        setAction: state.setAction
    })));


    const trainerId = action === "assignClient" ? id : 0;
    const clientId = action === "assignTrainer" ? id : 0;

    const INITIAL_VALUES: TDefaultValue<TTrainerClientData> = {
        trainerId: { value: trainerId },
        clientId: { value: clientId },
    };


    return (
        <FormHandler<TTrainerClientData, IMessageResponse, ITrainerClientAssignFormExtraProps>
            storeKey="assignTrainer"
            FormComponent={TrainerClientAssignFormModal}
            mutationFn={assignTrainerToClient}
            dto={CreateTrainerClientDto}
            initialValues={INITIAL_VALUES}
            validationMode={EVALIDATION_MODES.OnChange}
            onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });
                setAction('none');
            }}
            formProps={{
                trainerId,
                clientId,
                open: action === 'assignClient' || action === 'assignTrainer' || action === 'createOrUpdate',
                onClose: () => setAction('none')
            }}

        />

    );
}
