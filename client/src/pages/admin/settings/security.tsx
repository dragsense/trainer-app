// External Libraries
import { z } from "zod";

// Components
import { FormHandler } from "@/handlers";

// Page Components
import SecurityCardForm from "@/components/admin/settings/form/security-card-form";

// Services
import { changePassword } from "@/services/user.api";

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



export default function SecurityPage() {

    const INITIAL_VALUES: TDefaultValue<PasswordChangeData> = {
        currentPassword: { value: "" },
        newPassword: { value: "" },
        confirmPassword: { value: "", notIncluded: true },
    };

    return (<FormHandler<PasswordChangeData, PasswordChangeData, IMessageResponse>
        storeKey={'securitySettings'}
        FormComponent={SecurityCardForm}
        validationSchema={passwordSchema}
        initialValues={INITIAL_VALUES}
        mutationFn={changePassword}
    />
    );
}
