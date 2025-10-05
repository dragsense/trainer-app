// External Libraries
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

// Custom Hooks
import { useInput } from "@/hooks/use-input";
import { useSearchableUsers } from "@/hooks/use-searchable";

// Types
import { TCustomInputWrapper } from "@/@types/form/field-config.type";
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
import { dtoToFields } from "@/lib/fields/dto-to-feilds";
import { CreateTrainerClientDto } from "@shared/dtos";

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
                useSearchable={() => useSearchableUsers({ level, initialParams: { page: 1, limit: 2 } })}
                getLabel={(item) => {

                    if (typeof item === 'object' && 'email' in item && item.email) {
                        return item.email
                    } 
                    return 'Select User'
                }}
                getKey={(item) => item.id.toString()}
                getValue={(item) => { return { id: item.id, email: item.email } }}
                shouldFilter={false}
            />
        )
    );

    const fields = useMemo(() => {

        return dtoToFields<TTrainerClientData>(CreateTrainerClientDto, {
            trainer: {
                disabled: !!trainerId,
                Component: (props: TCustomInputWrapper) => (
                    <UserSelect props={props} level={EUserLevels[EUserRole.TRAINER]} />
                ),


            },
            client: {
                disabled: !!clientId,
                Component: (props: TCustomInputWrapper) => (
                    <UserSelect props={props} level={EUserLevels[EUserRole.USER]} />
                ),
            },
        });
    }, [trainerId, clientId]);



    const inputs = useInput<TTrainerClientData>({
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
                {inputs.trainer as React.ReactNode}
                {inputs.client as React.ReactNode}

            </div>

        </ModalForm>
    );
}
