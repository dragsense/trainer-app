// Types
import type { StoreApi } from "zustand";
import { IMessageResponse } from "../api/response.type";

export type MutationFn<TFormData, TResponse> = (data: TFormData) => Promise<TResponse | IMessageResponse | void>;


export interface IFormHandlerBaseState<TResponse> {
  response: TResponse | IMessageResponse | void | null;
  isSubmitting: boolean;
  error: Error | null;
  isSuccess: boolean;
}



export interface IFormHandlerState<TFormData, TResponse> extends IFormHandlerBaseState<TResponse> {
  values: TFormData;

  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: Error | null) => void;
  onSubmit: (e: React.BaseSyntheticEvent | undefined) => void;
  setOnSubmit: (submitFn: (e: React.BaseSyntheticEvent | undefined) => void) => void;
  setValues: (values: TFormData) => void;
  syncWithMutation: (state: IFormHandlerBaseState<TResponse>) => void;
  reset: () => void;

}

export type IFormStoreApi<TFormData, TResponse> = StoreApi<IFormHandlerState<TFormData, TResponse>>;