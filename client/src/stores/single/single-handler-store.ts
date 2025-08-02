// External Libraries
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types 
import { ISingleHandlerState } from '@/@types/handler-types/single.type';
import { TQueryParams } from '@/@types/api/param.type';

// Config
import { config } from '@/config';

export const useSingleHandlerStore = <TResponse>(name: string, id: number = 0, initialParams: TQueryParams = {}) => {
    return create<ISingleHandlerState<TResponse>>()(
        devtools(
            (set) => ({
                name,
                id,
                params: initialParams,
                isLoading: false,
                error: null,
                response: null,

                isCreating: false,
                isEditing: false,
                isDeleting: false,
                isViewing: false,

                // State setters
                setIsLoading: (isLoading) => set({ isLoading }),
                setError: (error) => set({ error }),
                setResponse: (response) => set({ response }),
                setParams: (params) => set({ params }),

                setMode: (mode, id: number = 0) => {
                    const newState = {
                        id,
                        isCreating: false,
                        isEditing: false,
                        isDeleting: false,
                        isViewing: false,
                    };

                    switch (mode) {
                        case 'create': newState.isCreating = true; break;
                        case 'edit': newState.isEditing = true; break;
                        case 'delete': newState.isDeleting = true; break;
                        case 'view': newState.isViewing = true; break;
                    }

                    set(newState);
                },

    
                setResetActions: () => set({
                    id: 0,
                    isCreating: false,
                    isEditing: false,
                    isDeleting: false,
                    isViewing: false,
                }),

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
                    isCreating: false,
                    isEditing: false,
                    isDeleting: false,
                    isViewing: false,
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
