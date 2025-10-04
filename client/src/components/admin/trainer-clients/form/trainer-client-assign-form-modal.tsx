// External Libraries
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TFieldConfig } from "@/@types/form/field-config.type";
import { TFormHandlerStore } from "@/stores";
import { TTrainerClientData } from "@shared/types/trainer-clients.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { EUserLevels, EUserRole } from "@shared/enums/user.enum";
import { IUser } from "@shared/interfaces/user.interface";

// Components
import { Button } from "@/components/ui/button";
import { ModalForm } from "@/components/form-ui/modal-form";
import { SearchableInputWrapper } from "@/components/shared-ui/searchable-input-wrapper";
import { THandlerComponentProps } from "@/@types/handler-types";
import { useShallow } from "zustand/react/shallow";

export interface ITrainerClientAssignFormExtraProps {
    trainerId?: number;
    clientId?: number;
    open: boolean;
    onClose: () => void;
}


export interface ITrainerClientAssignFormModalProps extends THandlerComponentProps<TFormHandlerStore<TTrainerClientData, IMessageResponse, ITrainerClientAssignFormExtraProps>> {
}

export default function TrainerClientAssignFormModal({
    storeKey,
    store
}: ITrainerClientAssignFormModalProps) {

    if (!store) {
        return `Form store "${storeKey}" not found. Did you forget to register it?`;
    }

    const { isSubmitting, extra } = store(useShallow(state => ({
        isSubmitting: state.isSubmitting,
        extra: state.extra,
    })));

    const {
        trainerId,
        clientId,
        open,
        onClose,
    } = extra;


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

    const fields = useMemo<TFieldConfig<TTrainerClientData>[]>(() => [
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
                <UserSelect props={props} level={EUserLevels[EUserRole.TRAINER]} />

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
                <UserSelect props={props} level={EUserLevels[EUserRole.USER]} />

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
        <ModalForm<TTrainerClientData, IMessageResponse, ITrainerClientAssignFormExtraProps>
            title={`Assign ${clientId ? 'Trainer to Client' : 'Client to Trainer'}`}
            description={`Assign a ${clientId ? 'trainer to a client' : 'client to a trainer'}`}
            open={open}
            onOpenChange={onOpenChange}
            formStore={store}
            footerContent={formButtons}
            width="3xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {inputs}
            </div>

        </ModalForm>
    );
}
