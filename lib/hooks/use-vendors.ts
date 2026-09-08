"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type {
  CreatePortfolioItemRequest,
  Id,
  PortfolioItem,
  Vendor,
  VendorProfilePayload,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";

/** Vendor directory + detail. Clients browse and inspect; vendors edit `me`. */

export type VendorFilters = { search?: string | null };

export function useVendors(filters: VendorFilters = {}) {
  const params = filters.search ? { search: filters.search } : undefined;
  return useQuery({
    queryKey: queryKeys.vendors.list(filters),
    queryFn: async () => unwrapList<Vendor>(await api.get("vendors/", params)),
  });
}

export function useVendor(id: Id) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => api.get<Vendor>(`vendors/${id}/`),
    enabled: id !== undefined && id !== null && id !== "",
  });
}

/**
 * The signed-in vendor's own profile. Returns `null` (not an error) on 404 so
 * the "create your profile" flow can branch cleanly — an account only becomes a
 * vendor once this exists.
 */
export function useMyVendorProfile() {
  return useQuery({
    queryKey: queryKeys.vendors.me(),
    queryFn: async () => {
      try {
        return await api.get<Vendor>("vendors/me/");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });
}

export function useCreateVendorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VendorProfilePayload) =>
      api.post<Vendor>("vendors/me/", payload),
    onSuccess: () => invalidate.vendorProfileMutated(qc),
  });
}

export function useUpdateVendorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VendorProfilePayload) =>
      api.patch<Vendor>("vendors/me/", payload),
    onSuccess: () => invalidate.vendorProfileMutated(qc),
  });
}

export function useAddPortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePortfolioItemRequest) => {
      const fd = new FormData();
      fd.set("image", input.image);
      if (input.title) fd.set("title", input.title);
      if (input.description) fd.set("description", input.description);
      return api.post<PortfolioItem>("vendors/me/portfolio/", fd);
    },
    onSuccess: () => invalidate.portfolioMutated(qc),
  });
}

export function useDeletePortfolioItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: Id) =>
      api.delete<null>(`vendors/me/portfolio/${itemId}/`),
    onSuccess: () => invalidate.portfolioMutated(qc),
  });
}
