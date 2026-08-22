"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { Id, Vendor } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";

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
