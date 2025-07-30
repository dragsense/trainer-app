// Exteral Libraries
import { Navigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TResetPasswordData } from "@/@types/auth.type";
import { TDefaultValue } from "@/@types/form/field.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ResetPasswordForm } from "@/components/auth";

// Config
import { ROOT_ROUTE } from "@/config/routes.config";

// Services
import { resetPassword } from "@/services/auth.api";

// Schema
const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  token: z.string().min(1, 'Token is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});




export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || undefined;

  if (!token)
    return <Navigate to={ROOT_ROUTE} replace />

  const RESET_PASSWORD_INITIAL_VALUES: TDefaultValue<TResetPasswordData> = {
    newPassword: { value: "" },
    confirmPassword: { notIncluded: true, value: "" },
    token: { value: token },
  };

  return (
    <FormHandler<TResetPasswordData, void>
      mutationFn={resetPassword}
      FormComponent={ResetPasswordForm}
      initialValues={RESET_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={resetPasswordSchema}
      onSuccess={() => toast.success('Password reset successful')}
      onError={(error) => toast.error('Failed to reset password: ' + error?.message)}
      storeKey="resetPassword"
    />
  );
}
