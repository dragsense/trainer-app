// External Libraries
import { ReactNode } from "react";

// Components
import { CardForm } from "@/components/form-ui/card-form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field.type";

// Stores
import { TFormHandlerStore, useRegisteredStore } from "@/stores";

interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ISecurityCardFormProps {
    storeKey: string;
}

export default function SecurityCardForm({ storeKey }: ISecurityCardFormProps) {
    const formStoreKey = storeKey + "-form";

    // Move store calls to top level
    const formStore = useRegisteredStore<TFormHandlerStore<Partial<PasswordChangeData>, PasswordChangeData>>(formStoreKey);

    // Handle missing stores after hooks are called
    if (!formStore) {
        return <div>Form store "{formStoreKey}" not found. Did you forget to register it?</div>;
    }

    const isSubmitting = formStore(state => state.isSubmitting);

    const fields: TFieldConfig[] = [
        // ─── Password Change Fields ──────────────
        {
            id: "currentPassword",
            name: "currentPassword",
            label: "Current Password",
            placeholder: "Enter your current password",
            type: "password",
            required: true,
        },
        {
            id: "newPassword",
            name: "newPassword",
            label: "New Password",
            placeholder: "Enter your new password",
            type: "password",
            required: true,
        },
        {
            id: "confirmPassword",
            name: "confirmPassword",
            label: "Confirm New Password",
            placeholder: "Confirm your new password",
            type: "password",
            required: true,
        },
    ];

    const { inputs } = useInput({
        fields,
        showRequiredAsterisk: true,
    });

    const footerContent: ReactNode = (
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Changing..." : "Change Password"}
            </Button>
        </div>
    );

    return (
        <CardForm
            title="Change Password"
            description="Update your account password for security"
            footerContent={footerContent}
            formStore={formStore}
        >
            <div className="space-y-4">
                {inputs}
            </div>
        </CardForm>
    );
}
