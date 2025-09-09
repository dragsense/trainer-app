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

  const values = useMemo(() => {
    return Object.keys(initialValues)
      .map((key) => ({
        [key]: initialValues[key as keyof typeof initialValues].value
      }))
      .reduce((acc, curr) => ({ ...acc, ...curr }), {}) as TFormData;
  }, [initialValues]);


  let store = useRegisteredStore<TFormHandlerStore<TFormData, TResponse>>(formStoreKey);
  if (!store) {
    store = useFormHandlerStore<TFormData, TResponse>(values, mutationFn);
    registerStore<TFormHandlerStore<TFormData, TResponse>>(formStoreKey, store);
  }


  const handleSubmit = async (formData: TFormData) => {

    const submissionData = Object.entries(initialValues).reduce((acc, [key, config]) => {
      if (!config.notIncluded) {
        acc[key as keyof TFormData] = formData[key as keyof TFormData] ?? initialValues[key].value;
      }
      return acc;
    }, {} as TFormData);



    try {
      store.getState().syncWithMutation({
        isSubmitting: true,
        error: null,
        isSuccess: false,
        response: null,
      });

      const response = await mutationFn(submissionData);

      store.getState().syncWithMutation({
        isSubmitting: false,
        error: null,
        isSuccess: true,
        response,
      });

      toast.success("Form submitted successfully!");
      onSuccess?.(response);
    } catch (error: any) {
      store.getState().syncWithMutation({
        isSubmitting: false,
        error,
        isSuccess: false,
        response: null,
      });

      toast.error(`Failed to submit form: ${error.message}`);
      onError?.(error);
    }
  };

  useEffect(() => {
    registerStore(formStoreKey, store);
    store.getState().setOnSubmit(form.handleSubmit(handleSubmit));
    return () => {
      deregisterStore(formStoreKey);
      store.getState().reset();
    };
  }, [formStoreKey]);

  const form = useForm<TFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: (values || {}) as DefaultValues<TFormData>,
    mode: validationMode,
  });



  const FormWrapper = ({ children }: { children: ReactNode }) => <Form {...form}>

    {children}
  </Form>;


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
