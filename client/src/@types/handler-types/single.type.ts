// Types
import type { StoreApi } from "zustand";

export interface ISingleHandlerBaseState<TResponse> {
  response?: TResponse | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;

}

export interface ISingleHandlerState<TResponse> extends ISingleHandlerBaseState<TResponse> {

  id: number;
  name: string,
  isCreating: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  isViewing: boolean;

  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setResponse: (response: TResponse) => void;

 setMode: (mode: 'create' | 'edit' | 'delete' | 'view', id?: number) => void;

  setResetActions: () => void;

  syncWithQuery: (state: ISingleHandlerBaseState<TResponse>) => void;

  reset: () => void;
}

export type ISingleStoreApi<TResponse> = StoreApi<ISingleHandlerState<TResponse>>;

