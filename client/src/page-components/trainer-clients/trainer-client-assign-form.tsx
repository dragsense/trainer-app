
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { TTrainerClientData } from "@/@types/trainer.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IUser } from "@/@types/user.type";

// Layouts
import { TrainerClientAssignFormModal } from "@/components/admin";

// Services
import { assignTrainerToClient } from "@/services/trainer-client.api";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Schema
export const AssignTrainerSchema = z.object({
    trainerId: z.number().min(1, "Trainer is required"),
    clientId: z.number().min(1, "Client is required"),
});

interface ITrainerClientAssignFormProps extends TActionComponentProps<any> {
}


interface ITrainerClientAssignFormExtraProps {
    trainerId?: number;
    clientId?: number;
    open: boolean;
    onClose: () => void;
}

export default function TrainerClientAssignForm({
    storeKey
}: ITrainerClientAssignFormProps) {

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IUser>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { id, action, reset } = singleStore(useShallow(state => ({
        id: state.id,
        action: state.action,
        reset: state.reset,

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
            validationSchema={AssignTrainerSchema}
            initialValues={INITIAL_VALUES}
            validationMode={EVALIDATION_MODES.OnChange}
            formProps={{
                trainerId,
                clientId,
                open: !!action,
                onClose: reset
            }}

        />

    );
}
