// External Libraries
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Types
import { TLoginData } from "@/@types/auth.type";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { LoginForm } from "@/components/auth";

// Services
import { login } from "@/services/auth.api";

// config
import { ADMIN_ROUTES } from "@/config/routes.config";


// Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});



export default function Login() {

  const navigate = useNavigate();

  const LOGIN_INITIAL_VALUES: TDefaultValue<TLoginData> = {
    email: { value: "admin@trainer-app.com" },
    password: { value: "admin1245" },
  };


  return (
    <FormHandler<TLoginData, void>
      mutationFn={login}
      FormComponent={LoginForm}
      initialValues={LOGIN_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={loginSchema}
      onSuccess={() => {
        toast.success('Login successful')
        navigate(ADMIN_ROUTES.DASHBOARD)
      }
      }
      onError={(error) => toast.error('Login failed: ' + error?.message)}
      storeKey="login"
    />
  );
}
