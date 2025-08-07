// External Libraries
import { ReactNode } from "react";

// Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";
import { TProfileData } from "@/@types/user.type";
import { IMessageResponse } from "@/@types/api/response.type";

// Stores
import { TFormHandlerStore, useRegisteredStore } from "@/stores";

interface IProfileCardFormProps {
    storeKey: string;
}

export default function ProfileCardForm({ storeKey }: IProfileCardFormProps) {
    const formStoreKey = storeKey + "-form";

    const formStore = useRegisteredStore<TFormHandlerStore<TProfileData, IMessageResponse>>(formStoreKey);

    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }


    const isSubmitting = formStore(state => state.isSubmitting)

    const fields: TFieldConfig[] = [
        // ─── Basic Info ──────────────
        {
            id: "firstName",
            name: "firstName",
            label: "First Name",
            placeholder: "Enter your first name",
            type: "text",
            required: true,
        },
        {
            id: "lastName",
            name: "lastName",
            label: "Last Name",
            placeholder: "Enter your last name",
            type: "text",
            required: true,
        },
        {
            id: "phoneNumber",
            name: "phoneNumber",
            label: "Phone Number",
            placeholder: "Enter your phone number",
            type: "tel",
            required: false,
        },
        {
            id: "address",
            name: "address",
            label: "Address",
            placeholder: "Enter your address",
            type: "text",
            required: false,
        },

        // ─── Bio & Professional Info ─────
        {
            id: "bio",
            name: "bio",
            label: "Bio",
            placeholder: "Tell us about yourself...",
            type: "textarea",
            required: false,
        },

       
        {
            id: "fitnessGoals",
            name: "fitnessGoals",
            label: "Fitness Goals",
            type: "multiSelect",
            options: [
                { value: "weight-loss", label: "Weight Loss" },
                { value: "muscle-gain", label: "Muscle Gain" },
                { value: "endurance", label: "Endurance" },
                { value: "flexibility", label: "Flexibility" },
                { value: "strength", label: "Strength Training" },
                { value: "rehabilitation", label: "Rehabilitation" },
            ],
            required: false,
        },
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: true,
    });

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
        </div>
    );

    return (
        <CardForm
            title="Update Profile"
            description="Manage your personal information"
            footerContent={footerContent}
            formStore={formStore}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {inputs}
            </div>
        </CardForm>
    );
}
