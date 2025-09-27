// External Libraries
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Types
import { TSignupData } from "@shared/types/auth.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TDefaultValue } from "@/@types/form/field.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { SignupForm } from "@/components/auth";

// Services
import { signup } from "@/services/auth.api";
import { SignupDto } from "@shared/dtos/auth-dtos/signup.dto";

// Config
import { PUBLIC_ROUTES } from "@/config/routes.config";


export default function SignupPage() {
  const navigate = useNavigate();

  const SIGNUP_INITIAL_VALUES: TDefaultValue<TSignupData> = {
    firstName: { value: "" },
    lastName: { value: "" },
    email: { value: "" },
    password: { value: "" },
    confirmPassword: {  value: "" }
  };

  return (
    <FormHandler<TSignupData, IMessageResponse>
      mutationFn={signup}
      FormComponent={SignupForm}
      initialValues={SIGNUP_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      dto={SignupDto}
      onSuccess={() => {
        toast.success('Signup successful')
        navigate(PUBLIC_ROUTES.LOGIN)
      }}
      onError={(error) => toast.error('Signup failed: ' + error?.message)}
      storeKey="signup"
    />
  );
}
