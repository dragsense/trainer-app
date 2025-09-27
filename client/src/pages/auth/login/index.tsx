// External Libraries
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

// Types
import { TLoginData } from "@shared/types/auth.type";
import { ILoginResponse } from "@shared/interfaces/auth.interface";
import { TDefaultValue } from "@/@types/form/field.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { LoginForm } from "@/components/auth";

// Services
import { login } from "@/services/auth.api";
import { LoginDto } from "@shared/dtos/auth-dtos/login.dto";


export default function LoginPage() {
  const queryClient = useQueryClient();

  const LOGIN_INITIAL_VALUES: TDefaultValue<TLoginData> = {
    email: { value: "" },
    password: { value: "" },
  };

  return (
    <FormHandler<TLoginData, ILoginResponse>
      mutationFn={login}
      FormComponent={LoginForm}
      initialValues={LOGIN_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      dto={LoginDto}
      onSuccess={() => {
        toast.success('Login successful')
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }}
      onError={(error) => toast.error('Login failed: ' + error?.message)}
      storeKey="login"
    />
  );
}
