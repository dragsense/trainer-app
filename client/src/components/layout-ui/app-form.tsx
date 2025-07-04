// React
import { ReactNode } from 'react';

// External Libraries
import { DefaultValues, FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// UI Components
import { Form } from '../ui/form';

// Types
import { IFormStoreApi } from '@/@types/handler-types';

// Stores
import { useStore } from 'zustand';


interface IAppFormProps<TFormData, TResponse> {
  children: ReactNode;
  formStore: IFormStoreApi<TFormData, TResponse>;
}


export function AppForm<TFormData extends FieldValues, TResponse>({
  children,
  formStore
}: IAppFormProps<TFormData, TResponse>) {


  const {
    mutateAsync,
    values,
    schema,
    validationMode,
  } = useStore(formStore);

  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues: (values ?? {}) as DefaultValues<TFormData>,
    mode: validationMode,
  });

  const onSubmit: SubmitHandler<TFormData> = async (data) => {
    await mutateAsync(data);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {children}
      </form>
    </Form>
  );
}