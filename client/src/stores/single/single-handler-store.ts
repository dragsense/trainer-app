// External Libraries
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types 
import { ISingleHandlerState } from '@/@types/handler-types/single.type';
import { TQueryParams } from '@/@types/api/param.type';

// Config
import { config } from '@/config';

export const useSingleHandlerStore = <TResponse>(name: string, initialParams: TQueryParams = {}) => {
    return create<ISingleHandlerState<TResponse>>()(
        devtools(
            (set) => ({
                name,
                id: 0,
                params: initialParams,
                isLoading: false,
                error: null,
                response: null,
                action: '',

                // State setters
                setIsLoading: (isLoading) => set({ isLoading }),
                setError: (error) => set({ error }),
                setResponse: (response) => set({ response }),
                setParams: (params) => set({ params }),

                setAction: (action: string, id: number = 0) => {
                    set({ id, action });
                },

        

                syncWithQuery: ({ isLoading, error, isSuccess, response }) => {
                    set({
                        isLoading,
                        error,
                        isSuccess,
                        ...(response !== undefined ? { response } : {})
                    })
                },

                reset: () => set({
                    id: 0,
                    isLoading: false,
                    error: null,
                    response: null,
                    isSuccess: false,
                    action: '',
                })
            }),
            {
                name: 'single-handler-store',
                enabled: config.environment === 'development'
            }
        )
    );
};

export type TSingleHandlerStore<TResponse> = ReturnType<typeof useSingleHandlerStore<TResponse>>;
