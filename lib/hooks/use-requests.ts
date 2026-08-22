"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { DesignRequest, Id, ReferenceImage, RequestStatus } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";
import type { RequestFormValues } from "@/lib/validation/request";

/**
 * Design-request data access. Clients see their own requests; the same list
 * endpoint is the open job board for vendors (see Overview.md). Filters come
 * from the URL (nuqs) and feed the query key so a shared URL reproduces the view.
 */

export type RequestFilters = { status?: RequestStatus | null };

export function useRequests(filters: RequestFilters = {}) {
  const params = filters.status ? { status: filters.status } : undefined;
  return useQuery({
    queryKey: queryKeys.requests.list(filters),
    queryFn: async () =>
      unwrapList<DesignRequest>(await api.get("requests/", params)),
  });
}

export function useRequest(id: Id) {
  return useQuery({
    queryKey: queryKeys.requests.detail(id),
    queryFn: () => api.get<DesignRequest>(`requests/${id}/`),
    enabled: id !== undefined && id !== null && id !== "",
  });
}

/** Build the multipart body for create/edit. Empty optional fields are skipped. */
function buildRequestFormData(values: RequestFormValues): FormData {
  const fd = new FormData();
  fd.set("title", values.title);
  fd.set("apparel_type", values.apparel_type);
  fd.set("quantity", String(values.quantity));
  if (values.sizes) fd.set("sizes", values.sizes);
  if (values.color_preferences)
    fd.set("color_preferences", values.color_preferences);
  if (values.deadline) fd.set("deadline", values.deadline);
  if (values.description) fd.set("description", values.description);
  if (values.design_image instanceof File)
    fd.set("design_image", values.design_image);
  return fd;
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: RequestFormValues) =>
      api.post<DesignRequest>("requests/", buildRequestFormData(values)),
    onSuccess: () => invalidate.requestMutated(qc),
  });
}

export function useUpdateRequest(id: Id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: RequestFormValues) =>
      api.patch<DesignRequest>(`requests/${id}/`, buildRequestFormData(values)),
    onSuccess: async () => {
      await invalidate.requestMutated(qc);
      await qc.invalidateQueries({ queryKey: queryKeys.requests.detail(id) });
    },
  });
}

export function useDeleteRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) => api.delete<null>(`requests/${id}/`),
    onSuccess: () => invalidate.requestMutated(qc),
  });
}

/**
 * Upload reference images. The target id is passed *per call* — in the create
 * flow the request id only exists after the create succeeds, so binding it at
 * hook-construction time would target an empty path.
 */
export function useAddReferenceImages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      files,
    }: {
      requestId: Id;
      files: File[];
    }) => {
      // The endpoint takes one image per call; upload sequentially so a
      // partial failure still surfaces (and earlier uploads persist).
      const created: ReferenceImage[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.set("image", file);
        created.push(
          await api.post<ReferenceImage>(
            `requests/${requestId}/reference-images/`,
            fd,
          ),
        );
      }
      return created;
    },
    // onSettled: a partial failure still persisted earlier uploads, so refresh
    // the detail cache regardless of whether the whole batch succeeded.
    onSettled: (_data, _error, variables) =>
      qc.invalidateQueries({
        queryKey: queryKeys.requests.detail(variables.requestId),
      }),
  });
}

export function useDeleteReferenceImage(requestId: Id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: Id) =>
      api.delete<null>(`requests/${requestId}/reference-images/${imageId}/`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.requests.detail(requestId) }),
  });
}
