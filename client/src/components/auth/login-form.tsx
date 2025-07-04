// React
import { useState } from 'react';

// Types
import { TLoginData, ILoginResponse } from '@/@types/auth.type';


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
import { useTypedFormStore } from '@/stores/form/form-store-registry';



interface ILoginFormProps {
  storeKey: string
}

export default function LoginForm({
  storeKey
}: ILoginFormProps) {

  const loginStore = useTypedFormStore<TLoginData, ILoginResponse>(storeKey);

  if (!loginStore) {
    return (`Form store "${storeKey}" not found. Did you forget to register it?`);
  }

  const isSubmitting = useStore(loginStore, state => state.isSubmitting);


  const [showPassword, setShowPassword] = useState(false);
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
    ],
    showRequiredAsterisk: true
  });

  return (
    <CardForm<TLoginData, ILoginResponse>
      title="Login"
      description="Enter your email and password to login to your account"
      formStore={loginStore}
      footerContent={
        <div className="flex flex-col gap-4 w-full">
          <Button type="submit" className="w-full" disabled={isSubmitting} >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
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

    </CardForm>

  );
}