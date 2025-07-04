// Types
import { z } from "zod";

// Custom Hooks
import { useAuth } from "@/hooks/use-auth";
import { EVALIDATION_MODES } from "@/@types/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ForgotPasswordForm } from "@/components/auth";
import { toast } from "sonner";

// Schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

// Extract the TypeScript type
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Get default values from schema
export const FORGOT_PASSWORD_INITIAL_VALUES: ForgotPasswordFormValues = {
  email: ""
};

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  return (
    <FormHandler<ForgotPasswordFormValues, void>
      mutationFn={forgotPassword}
      FormComponent={ForgotPasswordForm}
      initialValues={FORGOT_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={forgotPasswordSchema}
      onSuccess={() => toast.success('Password reset instructions sent to your email')}
      onError={(error) => toast.error('Failed to send reset instructions: ' + error?.message)}
      storeKey="forgotPasswordForm"
    />
  );
}
