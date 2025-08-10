
// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TActionComponentProps } from "@/@types/handler-types";
import { IUser, TUserData } from "@/@types/user.type";
import { UserGender, UserLevels, UserRole } from "#/modules/v1/users/enums/user.enum";


// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { TrainerFormModal } from "@/components/admin";
import { CredentialModal } from "@/components/shared-ui/credential-modal";

// Services
import { createUser, updateUser } from "@/services/user.api";


// Schema
export const TrainerSchema = z.object({
    // ─── Basic Info ─────────────────────
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters",
    }),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters",
    }),
    email: z.string().email({
        message: "Invalid email address",
    }),
    phoneNumber: z.string().min(10, {
        message: "Phone number must be at least 10 characters",
    }).optional(),

    level: z.number(),

    // ─── Optional Personal Info ─────────
    gender: z.nativeEnum(UserGender).optional(),
    address: z.string().optional(),
    // ─── Trainer-Specific Info ──────────
    bio: z.string().optional(),
    specialties: z.array(z.string()).min(1, {
        message: "At least one specialty is required",
    }),
    certifications: z.array(z.string()).min(1, {
        message: "At least one certification is required",
    }),
    experience: z.number().min(1, {
        message: "Experience must be a non-negative number",
    }),
    rating: z.number().min(0).max(5, {
        message: "Rating must be between 0 and 5",
    }),
});


interface ITrainerFormProps extends TActionComponentProps<any> {
}


interface ITrainerFormExtraProps {
    open: boolean,
    onClose: () => void,
    isEditing?: boolean
}

export default function TrainerForm({
    storeKey
}: ITrainerFormProps) {


    const queryClient = useQueryClient();
    const [credentialModalContent, setCredentialModalContent] = useState({
        open: false,
        email: "",
        password: ""
    });


    const INITIAL_VALUES: TDefaultValue<TUserData> = {
        firstName: { value: "" },
        lastName: { value: "" },
        email: { value: "" },
        phoneNumber: { value: "" },
        bio: { value: "" },
        address: { value: "" },
        gender: { value: UserGender.MALE },
        specialties: { value: [] },
        certifications: { value: [] },
        level: { value: UserLevels[UserRole.TRAINER] },
        isActive: { value: true },
        experience: { value: 0 },
        rating: { value: 0 },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IUser>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, setAction } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        setAction: state.setAction
    })));

    const isEditing = !!response;

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        const flatResponse = {
            ...(response || {}),
            ...(response?.profile || {}),
        };


        const updatedValues = {
            ...INITIAL_VALUES,
            ...Object.fromEntries(
                Object.entries(INITIAL_VALUES).map(([key, original]) => {
                    const newValue = (flatResponse as any)[key];
                    return [
                        key,
                        {
                            ...original,
                            value: newValue !== undefined ? newValue : original.value,
                        },
                    ];
                })
            ),

        };


        return updatedValues;
    };

    const initialValues = useMemo(() => getInitialValues(), [response]);


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
        <FormHandler<TUserData, { user: IUser, message: string } | IMessageResponse, ITrainerFormExtraProps>
            mutationFn={isEditing ? updateUser(response.id) : createUser}
            FormComponent={TrainerFormModal}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={TrainerSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-list"] });


                if (!isEditing && response && response.user) {
                    setCredentialModalContent({
                        open: true,
                        email: response.user.email,
                        password: response.user.password
                    })
                }

            }}
            formProps={{
                open: !!action,
                onClose: () => setAction('none'),
                isEditing,
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
