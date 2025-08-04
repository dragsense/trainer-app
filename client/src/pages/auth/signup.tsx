// External Libraries
import { z } from "zod";
import { useSearchParams } from "react-router-dom";
import { useMemo } from "react";

// Types
import { TSignupData } from "@/@types/auth.type";
import { IMessageResponse } from "@/@types/api/response.type";
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { TDefaultValue } from "@/@types/form/field.type";

// Handlers
import { FormHandler } from "@/handlers";

// Custom UI Components
import { SignupForm } from "@/components/auth";
import { toast } from "sonner";

// Services
import { signup, signupWithReferral } from "@/services/auth.api";

// Schema
const signupSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Invalid email address",
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export default function Signup() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const SIGNUP_INITIAL_VALUES: TDefaultValue<TSignupData> = {
    firstName: { value: "" },
    lastName: { value: "" },
    email: { value: "" },
    password: { value: "" },
    confirmPassword: { notIncluded: true, value: "" }
  };

  // Choose the mutation function based on whether we have a referral code
  const mutationFn = useMemo(() => {
    return referralCode 
      ? (data: TSignupData) => signupWithReferral(data, referralCode)
      : signup;
  }, [referralCode]);

  const successMessage = referralCode 
    ? 'Signup successful! Welcome to our referral program.' 
    : 'Signup successful';

  return (
    <div className="space-y-4">
      {referralCode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            🎉 You're signing up via a referral link! You and your referrer will both benefit from this partnership.
          </p>
        </div>
      )}
      
      <FormHandler<TSignupData, IMessageResponse>
        mutationFn={mutationFn}
        FormComponent={SignupForm}
        initialValues={SIGNUP_INITIAL_VALUES}
        validationMode={EVALIDATION_MODES.OnChange}
        validationSchema={signupSchema}
        onSuccess={() => toast.success(successMessage)}
        onError={(error) => toast.error('Signup failed: ' + error?.message)}
        storeKey="signupForm"
      />
    </div>
  );
}
