
// External Libraries
import { z } from "zod";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { TTrainerClientData } from "@/@types/trainer.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TExtraComponentProps } from "@/@types/handler-types";
import { IUser } from "@/@types/user.type";

// Layouts
import { TrainerClientAssignFormModal } from "@/components/admin";

// Services
import { assignTrainerToClient } from "@/services/trainer-client.api";

// Store
import { TListHandlerStore, useRegisteredStore } from "@/stores";
import { useStore } from "zustand";

// Schema
export const AssignTrainerSchema = z.object({
    trainerId: z.number().min(1, "Trainer is required"),
    clientId: z.number().min(1, "Client is required"),
});

interface IAssignTrainerClientFormProps extends TExtraComponentProps<any> {
    storeKey: string;
}


interface IAssignTrainerClientFormExtraProps {
    trainerId?: number;
    clientId?: number;
    open: boolean;
    onClose: () => void;
}

export default function AssignTrainerClientForm({
    storeKey,
}: IAssignTrainerClientFormProps) {

    const listStoreKey = storeKey + "-list";

    const listStore = useRegisteredStore<TListHandlerStore<IUser>>(listStoreKey);

    if (!listStore) {
        return (`List store "${listStoreKey}" not found. Did you forget to register it?`);
    }

    const { itemAction, setItemAction } = useStore(listStore);

    const trainerId = itemAction?.type === "trainer" ? itemAction?.id : 0;
    const clientId = itemAction?.type === "client" ? itemAction?.id : 0;

    const INITIAL_VALUES: TDefaultValue<TTrainerClientData> = {
        trainerId: { value: trainerId },
        clientId: { value: clientId },
    };

    return (
        <FormHandler<TTrainerClientData, IMessageResponse, IAssignTrainerClientFormExtraProps>
            storeKey="assignTrainer"
            FormComponent={TrainerClientAssignFormModal}
            mutationFn={assignTrainerToClient}
            validationSchema={AssignTrainerSchema}
            initialValues={INITIAL_VALUES}
            validationMode={EVALIDATION_MODES.OnChange}
            formProps={{
                trainerId,
                clientId,
                open: itemAction?.action === "assign",
                onClose: () => {
                    setItemAction(null);
                },
            }}

        />

    );
}
