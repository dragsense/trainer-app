
// External Libraries
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {  useState } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
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
import { strictDeepMerge } from "@/utils";
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


    const action = store((state) => state.action);
    const response = store((state) => state.response);
    const isLoading = store((state) => state.isLoading);
    const extra = store((state) => state.extra);
    const setAction =  store.getState().setAction;
    const reset = store.getState().reset;



    if (isLoading) {
        return (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }




    const INITIAL_VALUES: TUserData = {

        email: "",
        level: extra.level,
        isActive: true,

        profile: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            bio: "",
            dateOfBirth: new Date(
                new Date().setFullYear(new Date().getFullYear() - 12)
            ).toISOString(),
            address: "",
            gender: EUserGender.MALE,
            specialties: [],
            experience: 0
        }
    };

    const initialValues = strictDeepMerge<TUserData>(INITIAL_VALUES, response ?? {});

    const handleClose = () => {
        reset();
        setAction('none');
        setCredentialModalContent({ open: false, email: "", password: "" });
    };


    const isEditing = !!response?.id;
    const mutationFn = isEditing ? updateUser(response.id) : createUser;
    const dto = isEditing ? UpdateUserDto : CreateUserDto;

    return <>
        <FormHandler<TUserData, TUserResponse, IUserFormModalExtraProps>
            mutationFn={mutationFn}
            FormComponent={UserFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            dto={dto}
            validationMode={EVALIDATION_MODES.OnSubmit}
            isEditing={isEditing}
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
