// External Libraries
import { z } from "zod";

// Components
import { FormHandler } from "@/handlers";

// Page Components
import { SecurityCardForm } from "@/components/admin";

// Services
import { changePassword } from "@/services/user.api";

// Types
import { TDefaultValue } from "@/@types/form/field-config.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TUserResetPasswordData } from "@shared/types/user.type";
import { ResetPasswordDto } from "@shared/dtos/user-dtos/reset-password.dto";    

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});



export default function SecurityPage() {

    const INITIAL_VALUES: TDefaultValue<TUserResetPasswordData & { confirmPassword: string }> = {
        currentPassword: { value: "" },
        password: { value: "" },
        confirmPassword: { value: "" },
    };

    return (<FormHandler<Omit<TUserResetPasswordData, 'currentPassword'>, IMessageResponse>
        storeKey={'securitySettings'}
        FormComponent={SecurityCardForm}
        dto={ResetPasswordDto}
        initialValues={INITIAL_VALUES}
        mutationFn={changePassword}
    />
    );
}



