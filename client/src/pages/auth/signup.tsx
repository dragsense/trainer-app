// External Libraries
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Types
import { TSignupData } from "@/@types/auth.type";
import { IMessageResponse } from "@/@types/api/response.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TDefaultValue } from "@/@types/form/field.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { SignupForm } from "@/components/auth";

// Services
import { signup } from "@/services/auth.api";


// Config
import { PUBLIC_ROUTES } from "@/config/routes.config";

// Schema
const signupSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Signup() {
  const navigate= useNavigate();

  const SIGNUP_INITIAL_VALUES: TDefaultValue<TSignupData> = {
    firstName: { value: "" },
    lastName: { value: "" },
    email: { value: "" },
    password: { value: "" },
    confirmPassword: { notIncluded: true, value: "" }
  };

 

  return (<FormHandler<TSignupData, IMessageResponse>
        mutationFn={signup}
        FormComponent={SignupForm}
        initialValues={SIGNUP_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
        validationSchema={signupSchema}
        onSuccess={() => {
          toast.success('Signup successful')
          navigate(PUBLIC_ROUTES.LOGIN)
        }
        }
        onError={(error) => toast.error('Signup failed: ' + error?.message)}
        storeKey="signupForm"
      />
  );
}
