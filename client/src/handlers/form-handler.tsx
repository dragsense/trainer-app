// React & Hooks
import React, { ReactNode, useEffect, useMemo } from "react";
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
import { toast } from "sonner";


export interface IFormHandlerProps<TFormData, TResponse, TFormExtraProps> {
  mutationFn: (data: TFormData) => Promise<TResponse | IMessageResponse | void>;
  FormComponent: React.ComponentType<{
    storeKey: string
  } & TFormExtraProps>;

  formProps?: TFormExtraProps;
  onSuccess?: (response: TResponse | IMessageResponse | void) => void;
  onError?: (error: Error) => void;
  initialValues: Readonly<TDefaultValue<TFormData>>;
  validationMode?: EVALIDATION_MODES;
  validationSchema: z.ZodType<TFormData, any, TFormData>;
  storeKey: string;
  useManualForm?: boolean;
}


export function FormHandler<TFormData extends FieldValues, TResponse = any, TFormExtraProps extends Record<string, any> = {}>({
  mutationFn,
  FormComponent,
  formProps,
  onSuccess,
  onError,
  initialValues,
  validationMode = EVALIDATION_MODES.OnChange,
  validationSchema,
  storeKey,
  useManualForm = false,
}: IFormHandlerProps<TFormData, TResponse, TFormExtraProps>) {

  const formStoreKey = storeKey + "-form";

  const values = Object.keys(initialValues)
    .map((key) => ({
      [key]: initialValues[key as keyof typeof initialValues].value
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as TFormData;


  let store = useRegisteredStore<TFormHandlerStore<TFormData, TResponse>>(formStoreKey);
  if (!store) {
    store = useFormHandlerStore<TFormData, TResponse>(values, mutationFn);
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
      onSuccess?.(response);
      toast.success("Form submitted successfully!");
    },
    onError: (error) => {
      store.getState().syncWithMutation({
        isSubmitting: false,
        error,
        isSuccess: false,
        response: null,
      });
      onError?.(error);
      toast.error(`Failed to submit form: ${error.message}`);
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

  const form = useManualForm ? undefined : useForm<TFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: (values || {}) as DefaultValues<TFormData>,
    mode: validationMode,
  });

  useEffect(() => {
    if (form) {
      const submitHandler = form!.handleSubmit(async (data) => {
        const submissionData = Object.entries(initialValues).reduce((acc, [key, config]) => {
          if (!config.notIncluded) {
            acc[key as keyof TFormData] = data[key as keyof TFormData] ?? initialValues[key].value;
          }
          return acc;
        }, {} as TFormData);

        try {
          await mutation.mutateAsync(submissionData);
        } finally {
        }
      });

      store.getState().setOnSubmit(submitHandler);
    } else {
      const manualSubmitHandler = async (e: React.BaseSyntheticEvent | undefined) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        const currentValues = store.getState().values;

        try {
          const validatedData = validationSchema.parse(currentValues);
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
    }
  }, [form, initialValues, mutation, validationSchema]);



  const FormWrapper = ({ children }: { children: ReactNode }) => form ? <Form {...form}>{children}</Form> : children;

  const MemoizedFormComponent = useMemo(() => <FormWrapper><FormComponent
    storeKey={storeKey}
    {...(formProps ?? {} as TFormExtraProps)} />
  </FormWrapper>, [form, storeKey, FormComponent, formProps]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {MemoizedFormComponent}
    </ErrorBoundary >
  );
}
