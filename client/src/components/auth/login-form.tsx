// React
import { useState } from 'react';

// Types
import { TLoginData, ILoginResponse } from '@/@types/auth.type';
import { TFormHandlerStore } from '@/stores';
import { THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { Form } from '@/components/form-ui/form';

// Hooks
import { useInput } from '@/hooks/use-input';

// Stores
import { useStore } from 'zustand';
import { AppCard } from '../layout-ui/app-card';
import { TFieldConfig } from '@/@types/form/field.type';

interface ILoginFormProps extends THandlerComponentProps<TFormHandlerStore<TLoginData, ILoginResponse, any>> {
}

export default function LoginForm({
  storeKey,
  store,
}: ILoginFormProps) {
  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = useStore(store, state => state.isSubmitting);


  const [showPassword, setShowPassword] = useState(false);

  const fields: TFieldConfig<TLoginData>[] = [
    {
      id: 'email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'username@example.com',
      startAdornment: <Mail className="h-4 w-4 text-muted-foreground" />,
      required: true
    },
    {
      id: 'password',
      name: 'password',
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      required: true,
      endAdornment: (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      ),
      bottomAdornment: (
        <span className="text-right">
          <Link to="/forgot-password" className="text-sm hover:underline">
            Forgot password?
          </Link>
        </span>
      )
    }
  ];

  const { inputs } = useInput({
    fields,
    showRequiredAsterisk: true
  });

  return (
    <Form<TLoginData, ILoginResponse>
      formStore={store}
    >

      <AppCard
        header={
          <>
            <h2 className="text-md font-semibold">Login</h2>
            <p className="text-sm text-muted-foreground">Enter your email and password to login to your account</p>
          </>
        }
        footer={
          <div className="flex flex-col gap-4 w-full">
            <Button type="submit" className="w-full" disabled={isSubmitting} >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-secondary hover:underline">
                  Sign up
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