// Types
import { TLoginData } from "@/@types/auth.type";
import { z } from "zod";

// Custom Hooks
import { useAuth } from "@/hooks/use-auth";
import { EVALIDATION_MODES } from "@/@types/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { LoginForm } from "@/components/auth";
import { toast } from "sonner";


// Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

// Extract the TypeScript type
export type LoginFormValues = z.infer<typeof loginSchema>;

// Get default values from schema
export const LOGIN_INITIAL_VALUES: LoginFormValues = {
  email: "",
  password: ""
};


export default function Login() {
  const { login } = useAuth();
  return (
    <FormHandler<TLoginData, void>
      mutationFn={login}
      FormComponent={LoginForm}
      initialValues={LOGIN_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={loginSchema}
      onSuccess={() => toast.success('Login successful')}
      onError={(error) => toast.error('Login failed: ' + error?.message)}
      storeKey="loginForm"
    />
  );
}
