// hooks/use-searchable-resource.ts
import { IListParams } from "@/@types/api/param.type";
import { useApiPaginatedQuery } from "./use-api-paginated-query";

import { IUser } from "@/@types/user.type";
import { fetchUsers } from "@/services/user.api";

import { ISession } from "@/@types/session.type";
import { fetchSessions } from "@/services/session.api";

import { IBilling } from "@/@types/billing.type";
import { fetchBillings } from "@/services/billing.api";

export function useSearchableResource<T>(
  key: string,
  fetcher: (params: IListParams) => Promise<any>,
  initialParams: IListParams = { page: 1, limit: 10 }
) {
  const { data, isLoading, error, setFilters } = useApiPaginatedQuery<T>(
    [key],
    fetcher,
    initialParams
  );

  return {
    response: data,
    isLoading,
    error,
    setFilters,
  };
}



export function useSearchableUsers({ level, initialParams }: { level?: number, initialParams?: IListParams }) {
  return useSearchableResource<IUser>(
    "searchable-users" + (level ? `-${level}` : ""),
    (params: IListParams) => fetchUsers(params, level),
    initialParams
  );
}



export function useSearchableSessions(initialParams?: IListParams) {
  return useSearchableResource<ISession>(
    "searchable-sessions",
    fetchSessions,
    initialParams
  );
}

export function useSearchableBillings(initialParams?: IListParams) {
  return useSearchableResource<IBilling>(
    "searchable-billings",
    fetchBillings,
    initialParams
  );
}

