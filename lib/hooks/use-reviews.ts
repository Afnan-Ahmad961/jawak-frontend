"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { CreateReviewRequest, Id, Review } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";
import type { ReviewFormValues } from "@/lib/validation/review";

/** Two-way reviews after an order completes. */

export function useVendorReviews(vendorId: Id) {
  return useQuery({
    queryKey: queryKeys.reviews.list({ vendor: vendorId }),
    queryFn: async () =>
      unwrapList<Review>(await api.get("reviews/", { vendor: vendorId })),
    enabled: vendorId !== undefined && vendorId !== null && vendorId !== "",
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ order, ...values }: ReviewFormValues & { order: Id }) => {
      const body: CreateReviewRequest = {
        order,
        rating: values.rating,
        comment: values.comment || undefined,
      };
      return api.post<Review>("reviews/", body);
    },
    onSuccess: () => invalidate.reviewCreated(qc),
  });
}
