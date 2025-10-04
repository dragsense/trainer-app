// React
import { useState } from 'react';

// Types
import { TSignupData } from '@shared/types/auth.type';
import { IMessageResponse } from '@shared/interfaces/api/response.interface';
import { TFormHandlerStore } from '@/stores';
import { THandlerComponentProps } from '@/@types/handler-types';

// External Libraries
import { Eye, EyeOff, Mail, Loader2, User } from 'lucide-react';
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

interface ISignupFormProps extends THandlerComponentProps<TFormHandlerStore<TSignupData, IMessageResponse, any>> {
}

export default function SignupForm({
  storeKey,
  store,
}: ISignupFormProps) {
  if (!store) {
    return `Form store "${storeKey}" not found. Did you forget to register it?`;
  }

  const isSubmitting = useStore(store, state => state.isSubmitting);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fields: TFieldConfig<TSignupData>[] = [
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
      )
    },
    {
      id: 'confirmPassword',
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: showConfirmPassword ? 'text' : 'password',
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
    },

    // ─── Profile Information ──────────────
    {
      id: "firstName",
      name: "firstName",
      label: "First Name",
      placeholder: "John",
      type: "text",
      startAdornment: <User className="h-4 w-4 text-muted-foreground" />,
      required: true,
    },
    {
      id: "lastName",
      name: "lastName",
      label: "Last Name",
      placeholder: "Doe",
      type: "text",
      startAdornment: <User className="h-4 w-4 text-muted-foreground" />,
      required: true,
    },
  ];

  const { inputs } = useInput({
    fields,
    showRequiredAsterisk: true
  });

  return (
    <Form<TSignupData, IMessageResponse>
    formStore={store}
  >
    <AppCard
      header={
        <>
          <h2 className="text-md font-semibold">Sign Up</h2>
          <p className="text-sm text-muted-foreground">Create your account with your email and password</p>
        </>
      }
      footer={
        <div className="flex flex-col gap-4 w-full">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-secondary hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      }
    >
     
        <div className="space-y-6">
          {/* Account Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Account Information</h3>
            <div className="space-y-4">
              {inputs.slice(0, 3)}
            </div>
          </div>

          {/* Profile Information Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputs.slice(3)}
            </div>
          </div>
        </div>

      </AppCard>
    </Form>
  );
}