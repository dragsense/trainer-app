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
import { TQueryParams } from "@/@types/api/param.type";
import { useShallow } from "zustand/shallow";
import { pickKeys, unwrapValues } from "@/utils";


export interface IFormHandlerProps<TFormData, TResponse, TExtraProps extends Record<string, any> = {}> {
  initialParams?: TQueryParams;

  mutationFn: (data: TFormData, params?: TQueryParams) => Promise<TResponse | IMessageResponse | void>;
  FormComponent: React.ComponentType<{
    storeKey: string,
    store: TFormHandlerStore<TFormData, TResponse, TExtraProps>
  }>;
  formProps?: TExtraProps;
  onSuccess?: (response: TResponse | IMessageResponse | void) => void;
  onError?: (error: Error) => void;
  initialValues: Readonly<TDefaultValue<TFormData>>;
  validationMode?: EVALIDATION_MODES;
  validationSchema: z.ZodType<TFormData, any, TFormData>;
  storeKey: string;
}


export function FormHandler<TFormData extends FieldValues, TResponse = any, TExtraProps extends Record<string, any> = {}>({
  initialParams = {},

  mutationFn,
  FormComponent,
  formProps,
  onSuccess,
  onError,
  initialValues,
  validationMode = EVALIDATION_MODES.OnChange,
  validationSchema,
  storeKey,
}: IFormHandlerProps<TFormData, TResponse, TExtraProps>) {

  const formStoreKey = storeKey + "-form";

  const values = useMemo(() => {

    return unwrapValues(initialValues) as TFormData;
  }, [initialValues]);


  let store = useRegisteredStore<TFormHandlerStore<TFormData, TResponse, TExtraProps>>(formStoreKey);
  if (!store) {
    store = useFormHandlerStore<TFormData, TResponse, TExtraProps>(values, formProps || {} as TExtraProps);
    registerStore<TFormHandlerStore<TFormData, TResponse, TExtraProps>>(formStoreKey, store);
  }

  const filteredExtra = store(useShallow((state) => pickKeys(state.extra, Object.keys(initialParams) as (keyof typeof initialParams)[])
  ));


  const handleSubmit = async (formData: TFormData) => {

    const submissionData = Object.entries(initialValues).reduce((acc, [key, config]) => {
      if (!config.notIncluded) {
        acc[key] = formData[key] ?? config.value;
      }
      return acc;
    }, {} as Record<string, any>) as TFormData;



    try {
      store.getState().syncWithMutation({
        isSubmitting: true,
        error: null,
        isSuccess: false,
        response: null,
      });

      const response = await mutationFn(submissionData, { ...initialParams, filteredExtra });

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
          store={store} />
      </FormWrapper>
    </ErrorBoundary >
  );
}
