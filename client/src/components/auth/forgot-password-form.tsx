// React

// Types
import { TForgotPasswordData } from '@shared/types/auth.type';
import { IMessageResponse } from '@shared/interfaces/api/response.interface';
import { TFormHandlerStore } from '@/stores';
import { THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/form-ui/form';

// Hooks
import { useInput } from '@/hooks/use-input';

// Stores
import { useStore } from 'zustand';
import { AppCard } from '../layout-ui/app-card';
import { TFieldConfig } from '@/@types/form/field-config.type';

interface IForgotPasswordFormProps extends THandlerComponentProps<TFormHandlerStore<TForgotPasswordData, IMessageResponse, any>> {
}

export default function ForgotPasswordForm({
  storeKey,
  store,
}: IForgotPasswordFormProps) {
  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = useStore(store, state => state.isSubmitting);

  const fields: TFieldConfig<TForgotPasswordData>[] = [
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'username@example.com',
      startAdornment: <Mail className="h-4 w-4 text-muted-foreground" />,
      required: true
    }

  ];

  const { inputs } = useInput({
    fields,
    showRequiredAsterisk: true
  });

  return (
    <Form<TForgotPasswordData, IMessageResponse>
      formStore={store}
    >
      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">Forgot Password</h2>
            <p className="text-sm text-muted-foreground">Enter your email address and we'll send you instructions to reset your password</p>
          </>
        }
        footer={
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

      </AppCard>
    </Form>
  );
}
