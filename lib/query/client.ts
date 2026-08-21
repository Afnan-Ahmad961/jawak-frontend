import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/http";

/**
 * QueryClient factory. One instance per browser session (see providers.tsx).
 * Defaults tuned for a dashboard: reasonable staleness, no retry on auth/404.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't hammer on auth/permission/not-found — only transient errors.
          if (error instanceof ApiError) {
            if ([401, 403, 404].includes(error.status)) return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
