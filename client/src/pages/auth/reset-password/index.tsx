// External Libraries
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TDefaultValue } from "@/@types/form/field.type";
import { IMessageResponse } from "@shared/interfaces/api/response.interface";
import { TAuthResetPasswordData } from "@shared/types/auth.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { ResetPasswordForm } from "@/components/auth";

// Services
import { resetPassword } from "@/services/auth.api";
import { ResetPasswordWithTokenDto } from "@shared/dtos/auth-dtos/auth-reset-password.dto";

// Config
import { PUBLIC_ROUTES } from "@/config/routes.config";



export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const RESET_PASSWORD_INITIAL_VALUES: TDefaultValue<TAuthResetPasswordData> = {
    token: { value: token ?? "" },
    password: { value: "" },
    confirmPassword: { value: "" }
  };
  
  if (!token) {
    navigate(PUBLIC_ROUTES.LOGIN);
    return null;
  }

  return (
    <FormHandler<TAuthResetPasswordData, IMessageResponse>
      mutationFn={resetPassword}
      FormComponent={ResetPasswordForm}
      initialValues={RESET_PASSWORD_INITIAL_VALUES}
      validationMode={EVALIDATION_MODES.OnChange}
      dto={ResetPasswordWithTokenDto}
      onSuccess={() => {
        toast.success('Password reset successfully')
        navigate(PUBLIC_ROUTES.LOGIN)
      }}
      onError={(error) => toast.error('Failed to reset password: ' + error?.message)}
      storeKey="reset-password"
    />
  );
}
