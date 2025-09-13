// React

// Types
import { TForgotPasswordData } from '@/@types/auth.type';

// External Libraries
import { Mail, Loader2 } from 'lucide-react';
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
import { FormErrors } from '../shared-ui/form-errors';

interface IForgotPasswordFormProps {
  storeKey: string;
}

export default function ForgotPasswordForm({
  storeKey
}: IForgotPasswordFormProps) {

  const formStoreKey = storeKey + "-form";

  const forgotPasswordStore = useRegisteredStore<TFormHandlerStore<TForgotPasswordData, IMessageResponse>>(formStoreKey);

  if (!forgotPasswordStore) {
    return (`Form store "${formStoreKey}" not found. Did you forget to register it?`);
  }

  const isSubmitting = useStore(forgotPasswordStore, state => state.isSubmitting);

  const { inputs } = useInput({
    fields: [
      {
        id: 'email',
        name: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'username@example.com',
        startAdornment: <Mail className="h-4 w-4 text-muted-foreground" />,
        required: true
      }
    ],
    showRequiredAsterisk: true
  });

  return (
    <CardForm<TForgotPasswordData, IMessageResponse>
      title="Forgot Password"
      description="Enter your email address and we'll send you instructions to reset your password"
      formStore={forgotPasswordStore}
      footerContent={
        <div className="flex flex-col gap-4 w-full">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Instructions
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-secondary hover:underline">
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

      <FormErrors /> 
    </CardForm>
  );
}
