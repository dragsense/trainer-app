
// External Libraries
import { date, z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { IUser, TUserData, TUserResponse } from "@/@types/user.type";
import { UserGender, UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";


// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { UserFormModal, IUserFormModalExtraProps } from "@/components/admin";
import { CredentialModal } from "@/components/shared-ui/credential-modal";

// Services
import { createUser, updateUser } from "@/services/user.api";
import { extractValues, pickKeys } from "@/utils";


const ProfileSchema = z.object({
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters",
    }),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters",
    }),
    phoneNumber: z.string().min(10, {
        message: "Phone number must be at least 10 characters",
    }).optional(),
    dateOfBirth: z.date().optional(),
    // ─── Optional Personal Info ─────────
    gender: z.nativeEnum(UserGender).optional(),
    address: z.string().optional(),
    // ─── User-Specific Info ──────────
    bio: z.string().optional(),
    specialties: z.array(z.string()).min(1, {
        message: "At least one specialty is required",
    }),

    experience: z.number().min(1, {
        message: "Experience must be a non-negative number",
    }),
    rating: z.number().min(0).max(5, {
        message: "Rating must be between 0 and 5",
    }),



});

// Schema
export const UserSchema = z.object({
    // ─── Basic Info ─────────────────────

    email: z.string().email({
        message: "Invalid email address",
    }),


    level: z.number(),

    profile: ProfileSchema,

});


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

    const { action, response, isLoading, setAction, extra } = store(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        extra: state.extra,
        setAction: state.setAction
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
                dateOfBirth: { value: new Date() },
                address: { value: "" },
                gender: { value: UserGender.MALE },
                specialties: { value: [] },
                experience: { value: 0 },
                rating: { value: 0 },
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
        setAction('none');
        setCredentialModalContent({ open: false, email: "", password: "" });
    };




    return <>
        <FormHandler<TUserData, TUserResponse, IUserFormModalExtraProps>
            mutationFn={response?.id ? updateUser(response.id) : createUser}
            FormComponent={UserFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={UserSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });

                if (response && response.user) {
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
