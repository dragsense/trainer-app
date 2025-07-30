// External Libraries
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types 
import { IListHandlerState, IListPaginationState } from '@/@types/handler-types/list.type';

// Config
import { config } from '@/config';

const initialPaginationState: IListPaginationState = {
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1,
  hasNextPage: false,
  hasPrevPage: false
};

export const useListHandlerStore = <TResponse>(initialFilters: Record<string, any> = {}) => {
  return create<IListHandlerState<TResponse>>()(
    devtools(
      (set) => ({
        // Base state
        isLoading: false,
        error: null,
        response: null,
        isSuccess: false,
        pagination: initialPaginationState,
        itemAction: null,

        // Query state
        filters: initialFilters,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        search: '',

        // Setters
        setFilters: (filters) => set({ filters }),
        setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
        setSearch: (search) => set({ search }),
        setPagination: (pagination) => set((state) => ({
          pagination: { ...state.pagination, ...pagination }
        })),
        setIsLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setResponse: (response) => set({ response }),

        // Item action setter 
        setItemAction: (action) => set({ itemAction: action })
        ,

        // Query sync
        syncWithQuery: ({ isLoading, error, isSuccess, response, pagination }) => {
          const update: Partial<IListHandlerState<TResponse>> = {
            isLoading,
            error,
            isSuccess
          };
          if (response !== undefined) {
            update.response = response;
          }
          if (pagination !== undefined) {
            update.pagination = { ...initialPaginationState, ...pagination };
          }
          set(update);
        },
        reset: () => set({
          isLoading: false,
          error: null,
          response: null,
          isSuccess: false,
          pagination: initialPaginationState,
          filters: initialFilters,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          search: ''
        })
      }),
      {
        name: 'list-handler-store',
        enabled: config.environment === 'development'
      }
    )
  );
};

export type TListHandlerStore<TResponse> = ReturnType<typeof useListHandlerStore<TResponse>>;
