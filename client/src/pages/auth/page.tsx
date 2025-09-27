// External Libraries
import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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

// Schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export default function LoginPage() {
  const queryClient = useQueryClient();

  const LOGIN_INITIAL_VALUES: TDefaultValue<TLoginData> = {
    email: { value: "" },
    password: { value: "" },
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
        queryClient.invalidateQueries({ queryKey: ["me"] });
      }}
      onError={(error) => toast.error('Login failed: ' + error?.message)}
      storeKey="login"
    />
  );
}
