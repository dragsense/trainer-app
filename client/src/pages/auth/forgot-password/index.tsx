// External Libraries
import React from "react";
import { z } from "zod";
import { toast } from "sonner";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TDefaultValue } from "@/@types/form/field.type";
import { IMessageResponse } from "@/@types/api/response.type";
import { TForgotPasswordData } from "@/@types/auth.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ForgotPasswordForm } from "@/components/auth";

// Services
import { forgotPassword } from "@/services/auth.api";

// Schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});

export default function ForgotPasswordPage() {
  const FORGOT_PASSWORD_INITIAL_VALUES: TDefaultValue<TForgotPasswordData> = {
    email: { value: "" }
  };

  return (
    <FormHandler<TForgotPasswordData, IMessageResponse>
      mutationFn={forgotPassword}
      FormComponent={ForgotPasswordForm}
      initialValues={FORGOT_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      validationSchema={forgotPasswordSchema}
      onSuccess={() => toast.success('Password reset instructions sent to your email')}
      onError={(error) => toast.error('Failed to send reset instructions: ' + error?.message)}
      storeKey="forgot-password"
    />
  );
}
