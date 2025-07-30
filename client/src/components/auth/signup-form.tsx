// React
import { useState } from 'react';

// Types
import { TSignupData } from '@/@types/auth.type';
import { IMessageResponse } from '@/@types/api/response.type';

// External Libraries
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Components
import { Button } from '@/components/ui/button';
import { CardForm } from '@/components/form-ui/card-form';

// Hooks
import { useInput } from '@/hooks/use-input';

// Stores
import { useStore } from 'zustand';
import { TFormHandlerStore, useRegisteredStore } from '@/stores';

interface ISignupFormProps {
  storeKey: string
}

export default function SignupForm({
  storeKey
}: ISignupFormProps) {

  const formStoreKey = storeKey + "-form";

  const signupStore = useRegisteredStore<TFormHandlerStore<TSignupData, IMessageResponse>>(formStoreKey);

  if (!signupStore) {
    return (`Form store "${formStoreKey}" not found. Did you forget to register it?`);
  }

  const isSubmitting = useStore(signupStore, state => state.isSubmitting);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { inputs } = useInput({
    fields: [
      {
        id: "firstName",
        name: "firstName",
        label: "First Name",
        placeholder: "John",
        type: "text",
        required: true,
      },
      {
        id: "lastName",
        name: "lastName",
        label: "Last Name",
        placeholder: "Doe",
        type: "text",
        required: true,
      },

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
      }
    ],
    showRequiredAsterisk: true
  });

  return (
    <CardForm<TSignupData, IMessageResponse>
      title="Sign Up"
      description="Create your account with your email and password"
      formStore={signupStore}
      footerContent={
        <div className="flex flex-col gap-4 w-full">

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
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
