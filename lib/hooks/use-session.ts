"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import type { User } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";

/**
 * The current user + role. The token is server-side only, so "am I logged in?"
 * is answered by whether `GET user/me/` succeeds through the BFF. Components read
 * role from here to branch UI; hard route protection is proxy.ts + Django.
 */
export function useSession() {
  const query = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => api.get<User>("user/me/"),
    staleTime: 5 * 60_000,
    retry: false,
  });

  return {
    user: query.data,
    role: query.data?.role,
    isLoading: query.isLoading,
    isAuthenticated: query.isSuccess && !!query.data,
    error: query.error,
  };
}

/** Clears the httpOnly cookies (auth route, not the BFF), then wipes the cache. */
export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      qc.clear();
      // Cookies are already gone server-side; proxy will allow /login.
      router.replace("/login");
      router.refresh();
    },
  });
}
