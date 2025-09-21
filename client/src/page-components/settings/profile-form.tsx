// External Libraries
import { z } from "zod";
import { useShallow } from 'zustand/shallow';
import { Loader2 } from "lucide-react";

// Handlers
import { FormHandler } from "@/handlers";

// Types
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { THandlerComponentProps } from "@/@types/handler-types";
import { IProfile, TUpdateProfileData } from "@/@types/user.type";

// Store
import { TSingleHandlerStore } from "@/stores";

// Components
import { ProfileCardForm } from "@/components/admin";

// Services
import { updateProfile } from "@/services/user.api";
import { extractValues } from "@/utils";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Schema
export const ProfileSchema = z.object({
    firstName: z.string().min(2, {
        message: "First name must be at least 2 characters",
    }),
    lastName: z.string().min(2, {
        message: "Last name must be at least 2 characters",
    }),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    fitnessGoals: z.array(z.string()).optional(),
    image: z.any().optional(),
});

interface IProfileFormProps extends THandlerComponentProps<TSingleHandlerStore<IProfile, any>> { }

export default function ProfileForm({ storeKey, store }: IProfileFormProps) {


    const queryClient = useQueryClient();

    const INITIAL_VALUES: TDefaultValue<TUpdateProfileData> = {
        firstName: { value: "" },
        lastName: { value: "" },
        phoneNumber: { value: "" },
        address: { value: "" },
        bio: { value: "" },
        fitnessGoals: { value: [] },
        image: { value: null },
    }; 

    if (!store) {
        return <div>Single store "{storeKey}" not found. Did you forget to register it?</div>;
    }


    const { response, isLoading } = store(useShallow(state => ({
        response: state.response,
        isLoading: state.isLoading,
    })));

    
    const initialValues = useMemo(() => {
        return extractValues(response, INITIAL_VALUES);
    }, [response]);



    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!response) {
        return <div>Profile not found</div>;
    }


    return (
        <FormHandler<TUpdateProfileData, IMessageResponse>
            mutationFn={updateProfile}
            FormComponent={ProfileCardForm}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                queryClient.invalidateQueries({ queryKey: [storeKey + "-single"] });
            }}
        />
    );
}