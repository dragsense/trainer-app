// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, TSingleHandlerStore, useRegisteredStore } from "@/stores";
import { ITrainerClient, TTrainerClientData } from "@/@types/trainer-client.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Hooks
import { useStore } from "zustand";
import { useUserListInput } from "@/hooks/use-user-list-input";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { IMessageResponse } from "@/@types/api/response.type";

export interface ITrainerClientFormModalProps {
    storeKey: string;
    trainerId?: number;
    clientId?: number;
}

export default function TrainerClientFormModal({
    storeKey,
    trainerId,
    clientId,
}: ITrainerClientFormModalProps) {

    const formStoreKey = storeKey + "-form";
    const singleStoreKey = storeKey + "-single";

    const formStore = useRegisteredStore<TFormHandlerStore<TTrainerClientData, IMessageResponse>>(formStoreKey);

    if (!formStore) {
        return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
    }

    const singleStore = useRegisteredStore<TSingleHandlerStore<ITrainerClient>>(singleStoreKey);

    if (!singleStore) {
        return `Single store "${singleStoreKey}" not found. Did you forget to register it?`;
    }

    const { isSubmitting } = useStore(formStore);
    const { isEditing, isCreating, setResetActions } = useStore(singleStore);

    const trainerInput = useUserListInput({
        isSubmitting,
        multiple: false,
        level: UserLevels[UserRole.TRAINER],
        prefix: "trainer",
        valueType: "number",
        disabled: trainerId ? true : false,
    });

    const clientInput = useUserListInput({
        isSubmitting,
        multiple: false,
        level: UserLevels[UserRole.USER],
        prefix: "client",
        valueType: "number",
        disabled: clientId ? true : false,
    });

    const fields: TFieldConfig[] = [
        ...trainerInput,
        ...clientInput,
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: true,
    });

    const onOpenChange = (state: boolean) => {
        if (state === false) setResetActions();
    };

    const formButtons = (
        <div className="flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    setResetActions();
                }}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Assignment' : 'Assign Trainer'}
            </Button>
        </div>
    );

    return (
        <ModalForm<TTrainerClientData, IMessageResponse>
            title={isEditing ? 'Update Trainer Assignment' : 'Assign Trainer to Client'}
            description={isEditing ? 'Update the trainer assignment' : 'Assign a trainer to a client'}
            open={isCreating || isEditing}
            onOpenChange={onOpenChange}
            formStore={formStore}
            footerContent={formButtons}
            width="3xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {inputs}
            </div>
        </ModalForm>
    );
}
