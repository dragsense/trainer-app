// Types
import { TFormHandlerStore } from './form-handler-store';

// Stores
import { useGlobalStore } from '@/stores';


export function registerFormStore<TFormData, TResponse>(
    key: string,
    store: TFormHandlerStore<TFormData, TResponse>
) {
    useGlobalStore.getState().addStore(key, store);
}

export function deregisterFormStore(key: string) {
    useGlobalStore.getState().removeStore(key);
}

export function useFormStore(key: string) {
    return useGlobalStore.getState().getStore(key);
}

export function useTypedFormStore<TFormData, TResponse>(key: string) {
    return useGlobalStore.getState().getStore<TFormHandlerStore<TFormData, TResponse>>(key);
}