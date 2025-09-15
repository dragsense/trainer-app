// External Libraries
import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TDefaultValue } from "@/@types/form/field.type";
import { IMessageResponse } from "@/@types/api/response.type";
import { TResetPasswordData } from "@/@types/auth.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ResetPasswordForm } from "@/components/auth";

// Services
import { resetPassword } from "@/services/auth.api";

// Config
import { PUBLIC_ROUTES } from "@/config/routes.config";

// Schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const RESET_PASSWORD_INITIAL_VALUES: TDefaultValue<TResetPasswordData> = {
    password: { value: "" },
    confirmPassword: { notIncluded: true, value: "" }
  };

  if (!token) {
    navigate(PUBLIC_ROUTES.LOGIN);
    return null;
  }

  return (
    <FormHandler<TResetPasswordData, IMessageResponse>
      mutationFn={(data) => resetPassword({ ...data, token })}
      FormComponent={ResetPasswordForm}
      initialValues={RESET_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={resetPasswordSchema}
      onSuccess={() => {
        toast.success('Password reset successfully')
        navigate(PUBLIC_ROUTES.LOGIN)
      }}
      onError={(error) => toast.error('Failed to reset password: ' + error?.message)}
      storeKey="reset-password"
    />
  );
}
