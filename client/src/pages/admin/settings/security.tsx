// External Libraries
import { z } from "zod";

// Components
import { FormHandler, SingleHandler } from "@/handlers";

// Page Components
import SecurityCardForm from "@/components/admin/settings/form/security-card-form";

// Services
import { changePassword } from "@/services/setting.api";

// Types
import { TDefaultValue } from "@/@types/form/field.type";
import { IMessageResponse } from "@/@types/api/response.type";

interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const defaultValues: TDefaultValue<PasswordChangeData> = {
    currentPassword: { value: "" },
    newPassword: { value: "" },
    confirmPassword: { value: "" },
};

export default function SecurityPage() {
    const storeKey = "security-settings";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Security Settings</h1>
                <p className="text-muted-foreground">Manage your account security</p>
            </div>

            <FormHandler<PasswordChangeData, PasswordChangeData, IMessageResponse>  
                storeKey={storeKey}
                FormComponent={SecurityCardForm}
                validationSchema={passwordSchema}
                initialValues={defaultValues}
                mutationFn={changePassword}
            />
        </div>
    );
}
