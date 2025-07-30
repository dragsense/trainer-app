// React & Hooks
import React, { ReactNode, useEffect } from "react";

// External Libraries
import { DefaultValues, FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


// Types
import { EVALIDATION_MODES } from "@/enums/form.enums";
import { z } from "zod";

// Custom Hooks
import { useApiMutation } from "@/hooks/use-api-mutation";

// UI Components
import { Form } from "@/components/ui/form";


// Error Components
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from "@/components/shared-ui/error-fallback";


// Stores
import { deregisterStore, registerStore, useFormHandlerStore, useRegisteredStore, TFormHandlerStore } from "@/stores";
import { IMessageResponse } from "@/@types/api/response.type";
import { TDefaultValue } from "@/@types/form/field.type";


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


  const form = useForm<TFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: (store.getState().values ?? {}) as DefaultValues<TFormData>,
    mode: validationMode,
  });


  useEffect(() => {
    const submitHandler = form.handleSubmit(async (data) => {
      const submissionData = Object.entries(initialValues).reduce((acc, [key, config]) => {
        if (!config.notIncluded) {
          acc[key as keyof TFormData] = config.notInput
            ? config.value 
            : data[key as keyof TFormData] || initialValues[key].value;
        }
        return acc;
      }, {} as TFormData);


      try {
        await mutation.mutateAsync(submissionData);
      } finally {
        // any cleanup here
      }
    });

    store.getState().setOnSubmit(submitHandler);
  }, [form, initialValues, mutation]);



  const FormWrapper = ({ children }: { children: ReactNode }) => (
    <Form {...form}>
      {children}
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
