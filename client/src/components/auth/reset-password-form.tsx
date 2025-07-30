// React
import { useState } from 'react';

// Types
import { TResetPasswordData } from '@/@types/auth.type';

// External Libraries
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { CardForm } from '@/components/form-ui/card-form';

// Hooks
import { useInput } from '@/hooks/use-input';

// Stores
import { useStore } from 'zustand';
import { TFormHandlerStore, useRegisteredStore } from '@/stores';
import { IMessageResponse } from '@/@types/api/response.type';

interface IResetPasswordFormProps {
  storeKey: string
}

export default function ResetPasswordForm({
  storeKey
}: IResetPasswordFormProps) {

  const formStoreKey = storeKey + "-form";

  const resetPasswordStore = useRegisteredStore<TFormHandlerStore<TResetPasswordData, IMessageResponse>>(formStoreKey);

  if (!resetPasswordStore) {
    return (`Form store "${formStoreKey}" not found. Did you forget to register it?`);
  }

  const isSubmitting = useStore(resetPasswordStore, state => state.isSubmitting);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { inputs } = useInput({
    fields: [
      {
        id: 'newPassword',
        name: 'newPassword',
        label: 'New Password',
        type: showPassword ? 'text' : 'password',
        placeholder: 'Enter your new password',
        required: true,
        endAdornment: (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )
      },
      {
        id: 'confirmPassword',
        name: 'confirmPassword',
        label: 'Confirm New Password',
        type: showConfirmPassword ? 'text' : 'password',
        placeholder: 'Confirm your new password',
        required: true,
        endAdornment: (
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )
      }
    ],
    showRequiredAsterisk: true
  });

  return (
    <CardForm<TResetPasswordData, IMessageResponse>
      title="Reset Password"
      description="Enter your new password to reset your account"
      formStore={resetPasswordStore}
      footerContent={
        <div className="flex flex-col gap-4 w-full">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        {inputs}
      </div>
    </CardForm>
  );
}
