
// External Libraries
import { date, z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TUserData } from "@shared/types/user.type";
import { IUser, TUserResponse } from "@shared/interfaces/user.interface";


// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { UserFormModal, IUserFormModalExtraProps } from "@/components/admin";
import { CredentialModal } from "@/components/shared-ui/credential-modal";

// Services
import { createUser, updateUser } from "@/services/user.api";
import { extractValues } from "@/utils";
import { EUserGender } from "@shared/enums";
import { CreateUserDto, UpdateUserDto } from "@shared/dtos";


export type TUserExtraProps = {
    level: number
}

interface IUserFormProps extends THandlerComponentProps<TSingleHandlerStore<IUser, TUserExtraProps>> {
}

export default function UserForm({
    storeKey,
    store,
}: IUserFormProps) {


    const queryClient = useQueryClient();
    const [credentialModalContent, setCredentialModalContent] = useState({
        open: false,
        email: "",
        password: ""
    });




    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction, reset, extra } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        extra: state.extra,
        setAction: state.setAction,
        reset: state.reset
    })));



    const INITIAL_VALUES: TDefaultValue<TUserData> = {

        email: { value: "" },
        level: { value: extra.level },
        isActive: { value: true },

        profile: {
            isNested: true,
            value: {
                firstName: { value: "" },
                lastName: { value: "" },
                phoneNumber: { value: "" },
                bio: { value: "" },
                dateOfBirth: { value: new Date(new Date().setFullYear(new Date().getFullYear() - 12)) },
                address: { value: "" },
                gender: { value: EUserGender.MALE },
                specialties: { value: [] },
                experience: { value: 0 }
            }

        }
    };

    const initialValues = useMemo(() => {

        return extractValues(response, INITIAL_VALUES);
    }, [response]);


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
        setCredentialModalContent({ open: false, email: "", password: "" });
    };


    return <>
        <FormHandler<TUserData, TUserResponse, IUserFormModalExtraProps>
            mutationFn={response?.id ? updateUser(response.id) : createUser}
            FormComponent={UserFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={response?.id ? UpdateUserDto : CreateUserDto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });

                if (response && 'user' in response && response.user) {
                    setCredentialModalContent({
                        open: true,
                        email: response.user.email,
                        password: response.user.password
                    })
                }

            }}
            formProps={{
                open: action === 'createOrUpdate',
                onClose: handleClose,
                isEditing: response?.id ? true : false,
                level: extra.level,
            }}
        />

        <CredentialModal
            open={credentialModalContent.open}
            onOpenChange={(state: boolean) => {
                if (!state) {
                    handleClose();
                }
            }}
            closeModal={() => {
                handleClose();
            }}
            email={credentialModalContent.email}
            password={credentialModalContent.password}
        />
    </>

}
