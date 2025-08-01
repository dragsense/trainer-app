import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface UseApiQueryProps<T> {
  queryKey: (string | number | object)[];
  queryFn: () => Promise<T>;
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;
}

export function useApiQuery<T>({ queryKey, queryFn, options }: UseApiQueryProps<T>) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}