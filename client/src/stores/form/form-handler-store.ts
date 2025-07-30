// External Libraries
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types 
import { IFormHandlerState } from '@/@types/handler-types/form.type';

// Config
import { config } from '@/config';



export const useFormHandlerStore = <TFormData, TResponse>(initalValues: TFormData
) => {
  return create<IFormHandlerState<TFormData, TResponse>>()(
    devtools(
      (set) => ({
        isSubmitting: false,
        error: null,
        response: null,
        isSuccess: false,
        values: initalValues,
        setError: (error) => set({ error }),
        setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
        setValues: (values) => set({ values }),
        setOnSubmit: (submitFn) => set({ onSubmit: submitFn }),
        syncWithMutation: ({ isSubmitting, error, isSuccess, response }) => {
          set({
            isSubmitting,
            error,
            isSuccess,
            ...(response !== undefined ? { response } : {})
          })
        },
        reset: () => set({
          isSubmitting: false,
          error: null,
          response: null,
          isSuccess: false
        })
      }),
      {
        name: 'form-handler-store',
        enabled: config.environment === 'development'
      }
    )
  );
};

export type TFormHandlerStore<TFormData, TResponse> = ReturnType<typeof useFormHandlerStore<TFormData, TResponse>>;


