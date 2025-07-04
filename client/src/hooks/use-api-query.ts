import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

type QueryFunction<T = any, P = any> = (params: P) => Promise<T>;

export function useApiQuery<T = any, P = any>(
  queryKey: string | any[],
  queryFn: QueryFunction<T, P>,
  params: P,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
): UseQueryResult<T, Error> & {
  params: P;
} {
  const query = useQuery<T, Error>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: () => queryFn(params),
    ...options,
  });

  return {
    ...query,
    params,
  };
}