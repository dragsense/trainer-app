// External Libraries
import { ReactNode } from "react";

// Components
import {  Form } from "@/components/form-ui/form";
import { Button } from "@/components/ui/button";

// Hooks
import { useInput } from "@/hooks/use-input";

// Types
import { TFieldConfig } from "@/@types/form/field-config.type";

// Stores
import { TFormHandlerStore } from "@/stores";
import { AppCard } from "@/components/layout-ui/app-card";
import { THandlerComponentProps } from "@/@types/handler-types";
import { TUserResetPasswordData } from "@shared/types/user.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";



interface ISecurityCardFormProps extends THandlerComponentProps<TFormHandlerStore<Omit<TUserResetPasswordData, 'currentPassword'>, IMessageResponse>> {
}

export default function SecurityCardForm({ storeKey, store }: ISecurityCardFormProps) {
    if (!store) {
        return <div>Form store "{storeKey}" not found. Did you forget to register it?</div>;
    }

    // Move store calls to top level
    const isSubmitting = store(state => state.isSubmitting);

    // Handle missing stores after hooks are called

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
        <Form
               
        formStore={store}
    >
        <AppCard
            header={
                <>
                    <h2 className="text-md font-semibold">Change Password</h2>
                    <p className="text-sm text-muted-foreground">Update your account password for security</p>
                </>
            }
            footer={footerContent}
        >
          
                <div className="space-y-4">
                    {inputs}
                </div>

              
            </AppCard>
        </Form>

    );
}
