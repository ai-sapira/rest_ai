/**
 * ✅ ROBUST QUERY HOOK - Prevents hanging requests and provides timeout handling
 * Use this to wrap any query that might hang indefinitely
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface RobustQueryOptions<T> extends UseQueryOptions<T> {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export function useRobustQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options: RobustQueryOptions<T> = {}
) {
  const {
    timeoutMs = 10000, // 10 seconds default timeout
    maxRetries = 3,
    retryDelayMs = 1000,
    ...queryOptions
  } = options;

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // Race between actual query and timeout
      try {
        return await Promise.race([queryFn(), timeoutPromise]);
      } catch (error: any) {
        // Enhanced error messages
        if (error?.message?.includes('timeout')) {
          throw new Error('La consulta tardó demasiado tiempo. Por favor, inténtalo de nuevo.');
        }
        if (error?.code === 'PGRST116') {
          throw new Error('No se encontraron datos.');
        }
        if (error?.message?.includes('network')) {
          throw new Error('Error de conexión. Verifica tu conexión a internet.');
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry for "not found" errors
      if (error?.message?.includes('No se encontraron datos')) {
        return false;
      }
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => retryDelayMs * Math.pow(2, attemptIndex), // Exponential backoff
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    ...queryOptions,
  });
}

export default useRobustQuery;
