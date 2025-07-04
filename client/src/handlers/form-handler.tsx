// React & Hooks
import React, { ReactNode, useEffect } from "react";

// External Libraries
import { DefaultValues, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


// Types
import { IMessageResponse } from "@/@types/general.type";
import { EVALIDATION_MODES } from "@/@types/enums/form.enums";
import { z } from "zod";

// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";

// UI Components
import { Form } from "@/components/ui/form";


// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";


// Stores
import { useFormHandlerStore } from "@/stores";
import { deregisterFormStore, registerFormStore, useTypedFormStore } from "@/stores/form/form-store-registry";
import { useStore } from "zustand";

interface FormHandlerProps<TFormData, TResponse, TFormExtraProps> {
  mutationFn: (data: TFormData) => Promise<TResponse | IMessageResponse | void>;
  FormComponent: React.ComponentType<{ storeKey: string } & TFormExtraProps>;
  formProps?: TFormExtraProps;
  onSuccess?: (response: TResponse | IMessageResponse | void) => void;
  onError?: (error: Error) => void;
  initialValues: Readonly<TFormData>;
  validationMode?: EVALIDATION_MODES;
  validationSchema: z.ZodType<TFormData, any, TFormData>;
  storeKey: string;
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
}: FormHandlerProps<TFormData, TResponse, TFormExtraProps>) {

  let store = useTypedFormStore<TFormData, TResponse>(storeKey);
  if (!store) {
    store = useFormHandlerStore<TFormData, TResponse>(initialValues);
    registerFormStore(storeKey, store);
  }



  const mutation = useApiMutation(mutationFn, {
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
    return () => {
      mutation.reset();
      deregisterFormStore(storeKey);
      store.getState().reset();
    };
  }, []);

  useEffect(() => {
    const unsubscribeStore = store.subscribe(
      (state) => {
        if (state.isSuccess && state.response && onSuccess) {
          console.log(state);

          onSuccess(state.response);
        }
        if (state.error && onError) {
          onError(state.error);
        }
      }
    );

    return unsubscribeStore;
  }, [onSuccess, onError]);


  const form = useForm<TFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: (store.getState().values ?? {}) as DefaultValues<TFormData>,
    mode: validationMode,
  });


  const onSubmit: SubmitHandler<TFormData> = async (data) => {
    try {
      store.getState().syncWithMutation({ isSubmitting: true, error: null, isSuccess: false, response: null });
      await mutation.mutateAsync(data);
      store.getState().reset();
    } finally {
    }
  };

  const FormWrapper = ({ children }: { children: ReactNode }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </Form>
  );

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
