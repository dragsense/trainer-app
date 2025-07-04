// Types
import { z } from "zod";

// Custom Hooks
import { useAuth } from "@/hooks/use-auth";
import { EVALIDATION_MODES } from "@/@types/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ResetPasswordForm } from "@/components/auth";
import { toast } from "sonner";

// Schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Extract the TypeScript type
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Get default values from schema
export const RESET_PASSWORD_INITIAL_VALUES: ResetPasswordFormValues = {
  password: "",
  confirmPassword: ""
};

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  return (
    <FormHandler<ResetPasswordFormValues, void>
      mutationFn={resetPassword}
      FormComponent={ResetPasswordForm}
      initialValues={RESET_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={resetPasswordSchema}
      onSuccess={() => toast.success('Password reset successful')}
      onError={(error) => toast.error('Failed to reset password: ' + error?.message)}
      storeKey="resetPasswordForm"
    />
  );
}
