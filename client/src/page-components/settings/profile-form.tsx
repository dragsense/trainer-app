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
import { TActionComponentProps } from "@/@types/handler-types";
import { IProfile, TUpdateProfileData } from "@/@types/user.type";

// Store
import { TSingleHandlerStore, useRegisteredStore } from "@/stores";

// Components
import { ProfileCardForm } from "@/components/admin";

// Services
import { updateProfile } from "@/services/user.api";

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
    fitnessGoals: z.string().optional(),
    image: z.any().optional(),
});

interface IProfileFormProps extends TActionComponentProps<any> {}

export default function ProfileForm({ storeKey }: IProfileFormProps) {
    const INITIAL_VALUES: TDefaultValue<TUpdateProfileData> = {
        firstName: { value: "" },
        lastName: { value: "" },
        phoneNumber: { value: "" },
        address: { value: "" },
        bio: { value: "" },
        fitnessGoals: { value: "" },
        image: { value: null },
    };

    const singleStoreKey = storeKey + "-single";
    const singleStore = useRegisteredStore<TSingleHandlerStore<IProfile>>(singleStoreKey);

    if (!singleStore) {
        return <div>Single store "{singleStoreKey}" not found. Did you forget to register it?</div>;
    }

    const { action, response, isLoading, reset } = singleStore(useShallow(state => ({
        action: state.action,
        response: state.response,
        isLoading: state.isLoading,
        reset: state.reset
    })));

    if (!response) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    const getInitialValues = (): typeof INITIAL_VALUES => {
        if (!response) {
            return INITIAL_VALUES;
        }

        // Extract profile data from response
        const profileData = response.profile || response;

        const updatedValues = {
            ...INITIAL_VALUES,
            ...Object.fromEntries(
                Object.entries(INITIAL_VALUES).map(([key, original]) => {
                    const newValue = (profileData as any)[key];
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

    const initialValues = getInitialValues();

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

    return (
        <FormHandler<TUpdateProfileData, IMessageResponse>
            mutationFn={updateProfile}
            FormComponent={ProfileCardForm}
            storeKey={storeKey}
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            validationMode={EVALIDATION_MODES.OnSubmit}
            onSuccess={(response) => {
                // Refresh the profile data
                singleStore.getState().refetch();
            }}
        />
    );
}