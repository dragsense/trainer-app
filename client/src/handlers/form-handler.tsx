// React & Hooks
import React, { ReactNode, useEffect } from "react";
import { z } from "zod";

// External Libraries
import { DefaultValues, FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";
// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";

// UI Components
import { Form } from "@/components/ui/form";


// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";


// Stores
import { deregisterStore, registerStore, useFormHandlerStore, useRegisteredStore, TFormHandlerStore } from "@/stores";
import { useStore } from "zustand";


export interface IFormHandlerProps<TFormData, TResponse, TFormExtraProps> {
  mutationFn: (data: TFormData) => Promise<TResponse | IMessageResponse | void>;
  FormComponent: React.ComponentType<{
    storeKey: string
  } & TFormExtraProps>;
  formProps?: TFormExtraProps;
  onSuccess?: (response: TResponse | IMessageResponse | void) => void;
  onError?: (error: Error) => void;
  initialValues: Readonly<TDefaultValue<TFormData>>;
  values?: TFormData;
  validationMode?: EVALIDATION_MODES;
  validationSchema: z.ZodType<TFormData, any, TFormData>;
  storeKey: string;
  useManualForm?: boolean; // New option for manual form handling
}


export function FormHandler<TFormData extends FieldValues, TResponse = any, TFormExtraProps extends Record<string, any> = {}>({
  mutationFn,
  FormComponent,
  formProps,
  onSuccess,
  onError,
  initialValues,
  values,
  validationMode = EVALIDATION_MODES.OnChange,
  validationSchema,
  storeKey,
  useManualForm = false, // Default to false for backward compatibility
}: IFormHandlerProps<TFormData, TResponse, TFormExtraProps>) {

  const formStoreKey = storeKey + "-form";

  let store = useRegisteredStore<TFormHandlerStore<TFormData, TResponse>>(formStoreKey);
  if (!store) {

    const values = Object.keys(initialValues)
      .filter((key) => !initialValues[key as keyof typeof initialValues].notInput)
      .map((key) => ({
        [key]: initialValues[key as keyof typeof initialValues].value
      }))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as TFormData;

    store = useFormHandlerStore<TFormData, TResponse>(values);
    registerStore<TFormHandlerStore<TFormData, TResponse>>(formStoreKey, store);
  }

  const mutation = useApiMutation(mutationFn, {
    onMutate: () => {
      store.getState().syncWithMutation({
        isSubmitting: true,
        error: null,
        isSuccess: false,
        response: null,
      });
    },
    onSuccess: (response) => {
      store.getState().syncWithMutation({
        isSubmitting: false,
        error: null,
        isSuccess: true,
        response,
      });
    },
    onError: (error) => {
      store.getState().syncWithMutation({
        isSubmitting: false,
        error,
        isSuccess: false,
        response: null,
      });

    }
  });

  useEffect(() => {
    registerStore(formStoreKey, store);
    return () => {
      mutation.reset();
      deregisterStore(formStoreKey);
      store.getState().reset();
    };
  }, [formStoreKey]);




  useEffect(() => {
    const unsubscribeStore = store.subscribe(
      (state) => {
        if (state.isSuccess && state.response && onSuccess) {
          onSuccess(state.response);
        }
        if (state.error && onError) {
          onError(state.error);
        }
      }
    );

    return unsubscribeStore;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (values)
      store.getState().setValues(values as TFormData);
  }, [values]);

  // React Hook Form setup (only if not using manual form)
  const form = !useManualForm ? useForm<TFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: (store.getState().values ?? {}) as DefaultValues<TFormData>,
      mode: validationMode,
  }) : null;

  useEffect(() => {
    if (useManualForm) {
      // Manual form submit handler
      const manualSubmitHandler = async (e: React.BaseSyntheticEvent | undefined) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        // Get current values from store
        const currentValues = store.getState().values;
        
        try {
          // Manual validation using Zod schema
          const validatedData = validationSchema.parse(currentValues);
          
          console.log("Manual form - submitting data:", validatedData);
          
          // Submit the validated data
          await mutation.mutateAsync(validatedData);
          
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("Validation errors:", error.errors);
            store.getState().setError(new Error("Validation failed: " + error.errors.map(e => e.message).join(", ")));
          } else {
            console.error("Submission error:", error);
            store.getState().setError(error as Error);
          }
        }
      };

      store.getState().setOnSubmit(manualSubmitHandler);
    } else {
      // React Hook Form submit handler
      const submitHandler = form!.handleSubmit(async (data) => {
        const currentValues = store.getState().values || {};

        const submissionData = Object.entries(initialValues).reduce((acc, [key, config]) => {
          if (!config.notIncluded) {
            acc[key as keyof TFormData] = config.notInput
              ? config.value
              : data[key as keyof TFormData] ?? initialValues[key].value;
          }
          return acc;
        }, {} as TFormData);

        console.log("React Hook Form - submitting data:", submissionData);
        console.log("currentValues data:", currentValues);

        try {
          await mutation.mutateAsync(submissionData);
        } finally {
          // any cleanup here
        }
      });

      store.getState().setOnSubmit(submitHandler);
    }
  }, [form, initialValues, mutation, useManualForm, validationSchema]);



  const FormWrapper = ({ children }: { children: ReactNode }) => {
    if (useManualForm) {
      // For manual form, just return a plain div (no React Hook Form wrapper)
      return <div>{children}</div>;
    } else {
      // For React Hook Form, wrap with Form component
      return <Form {...form!}>{children}</Form>;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <FormWrapper>
        <FormComponent
          storeKey={storeKey}
          {...(formProps ?? {} as TFormExtraProps)} />
      </FormWrapper>
    </ErrorBoundary >
  );
}
