// React & Hooks
import { useState } from "react";

// External Libraries
import {
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";

// Types
import { IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";


export function usePaginatedQuery<T = any>(
  queryKey: string | any[],
  queryFn: (params: IListParams) => Promise<IPaginatedResponse<T>>,
  initialParams: IListParams = {
    page: 1,
    limit: 10,
  },
  options?: Omit<
    UseQueryOptions<IPaginatedResponse<T>, Error>,
    "queryKey" | "queryFn"
  >,
) {
  const [params, setParams] = useState(initialParams);

  const query = useQuery<IPaginatedResponse<T>, Error>({
    queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), params],
    queryFn: () => queryFn(params),
    ...options,
  });



  // ---------- Param Updaters ----------
  const setPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    setParams((prev) => ({ ...prev, limit, page: 1 }));
  };


  const setFilters = (filters: Record<string, any>) => {
    setParams((prev) => ({ ...prev, filters, page: 1 }));
  };

  return {
    ...query,
    params,
    pagination: {
      page: params.page || 1,
      limit: params.limit  || 10,
      total: query.data?.total || 0,
      lastPage: query.data?.lastPage || 1,
      hasNextPage: query.data?.hasNextPage || false,
      hasPrevPage: query.data?.hasPrevPage || false,
    },
    setPage,
    setLimit,
    setFilters,

  };
}
