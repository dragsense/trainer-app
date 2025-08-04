// Types
import type { StoreApi } from "zustand";
import { TQueryParams } from "../api/param.type";

export interface ISingleHandlerBaseState<TResponse> {
  response?: TResponse | null;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;

}

export interface ISingleHandlerState<TResponse> extends ISingleHandlerBaseState<TResponse> {

  id: number;
  name: string,
  params: TQueryParams;
  action: string;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setResponse: (response: TResponse) => void;
  setParams: (params: TQueryParams) => void;
  setAction: (action: string, id?: number) => void;
  setResetActions: () => void;
  syncWithQuery: (state: ISingleHandlerBaseState<TResponse>) => void;

  reset: () => void;
}

export type ISingleStoreApi<TResponse> = StoreApi<ISingleHandlerState<TResponse>>;

