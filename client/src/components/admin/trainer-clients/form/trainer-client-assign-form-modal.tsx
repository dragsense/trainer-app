// External Libraries
import { Loader2 } from "lucide-react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, useRegisteredStore } from "@/stores";
import {  TTrainerClientData } from "@/@types/trainer-client.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";

// Hooks
import { useStore } from "zustand";
import { useUserListInput } from "@/hooks/use-user-list-input";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { IMessageResponse } from "@/@types/api/response.type";

export interface ITrainerClientAssignFormModalProps {
    storeKey: string;
    trainerId?: number;
    clientId?: number;
    open: boolean;
    onClose: () => void;
}

export default function TrainerClientAssignFormModal({
    storeKey,
    trainerId,
    clientId,
    open,
    onClose
}: ITrainerClientAssignFormModalProps) {

    const formStoreKey = storeKey + "-form";

    const formStore = useRegisteredStore<TFormHandlerStore<TTrainerClientData, IMessageResponse>>(formStoreKey);

    if (!formStore) {
        return `Form store "${formStoreKey}" not found. Did you forget to register it?`;
    }

    const { isSubmitting } = useStore(formStore);

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
        if (state === false) onClose();
    };

    const formButtons = (
        <div className="flex justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            >
                Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {'Assign Trainer'}
            </Button>
        </div>
    );

    return (
        <ModalForm<TTrainerClientData, IMessageResponse>
            title={'Assign Trainer to Client'}
            description={'Assign a trainer to a client'}
            open={open}
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
