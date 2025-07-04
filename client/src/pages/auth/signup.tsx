// Types
import { TSignupData } from "@/@types/auth.type";
import { z } from "zod";

// Custom Hooks
import { useAuth } from "@/hooks/use-auth";
import { EVALIDATION_MODES } from "@/@types/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { SignupForm } from "@/components/auth";
import { toast } from "sonner";

// Schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Extract the TypeScript type
export type SignupFormValues = z.infer<typeof signupSchema>;

// Get default values from schema
export const SIGNUP_INITIAL_VALUES: SignupFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: ""
};

export default function Signup() {
  const { signup } = useAuth();
  return (
    <FormHandler<TSignupData, void>
      mutationFn={signup}
      FormComponent={SignupForm}
      initialValues={SIGNUP_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={signupSchema}
      onSuccess={() => toast.success('Signup successful')}
      onError={(error) => toast.error('Signup failed: ' + error?.message)}
      storeKey="signupForm"
    />
  );
}
