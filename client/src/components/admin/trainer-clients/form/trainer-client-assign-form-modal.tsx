// External Libraries
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TFormHandlerStore, useRegisteredStore } from "@/stores";
import { TTrainerClientData } from "@/@types/trainer-client.type";
import { IMessageResponse } from "@/@types/api/response.type";
import { UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";
import { IUser } from "@/@types/user.type";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";


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

    const isSubmitting = formStore(state => state.isSubmitting);

    const UserSelect = React.memo(
        ({ props, level }: { props: any; level: number; }) => (
            <SearchableInputWrapper<IUser>
                {...props}
                modal={true}
                useSearchable={() => useSearchableUsers({ level })}
                getLabel={(item) => item.email}
                getKey={(item) => item.id.toString()}
                shouldFilter={false}
            />
        )
    );

    const fields = useMemo<TFieldConfig[]>(() => [
        {
            id: "trainerId",
            name: "trainerId",
            label: "Trainer",
            placeholder: "Select Trainer",
            type: "custom",
            required: true,
            disabled: !!trainerId,
            valueType: "number",
            Component: (props) => (
                <UserSelect props={props} level={UserLevels[UserRole.TRAINER]} />

            ),
        },
        {
            id: "clientId",
            name: "clientId",
            label: "Client",
            placeholder: "Select Client",
            type: "custom",
            required: true,
            disabled: !!clientId,
            valueType: "number",
            Component: (props) => (
                <UserSelect props={props} level={UserLevels[UserRole.USER]} />

            ),
        },
    ], [trainerId, clientId]);



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
                {`Assign ${clientId ? 'Trainer' : 'Client'}`}
            </Button>
        </div>
    );

    return (
        <ModalForm<TTrainerClientData, IMessageResponse>
            title={`Assign ${clientId ? 'Trainer to Client' : 'Client to Trainer'}`}
            description={`Assign a ${clientId ? 'trainer to a client' : 'client to a trainer'}`}
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
