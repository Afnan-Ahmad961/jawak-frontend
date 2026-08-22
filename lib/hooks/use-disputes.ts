"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { CreateDisputeRequest, Dispute, Id } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";
import type { DisputeFormValues } from "@/lib/validation/dispute";

/**
 * Disputes. Participants see their own; admins see all (same endpoint). The
 * client raises them on an order; resolution is the admin flow.
 */

export function useDisputes() {
  return useQuery({
    queryKey: queryKeys.disputes.list(),
    queryFn: async () => unwrapList<Dispute>(await api.get("disputes/")),
  });
}

export function useCreateDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ order, ...values }: DisputeFormValues & { order: Id }) => {
      const body: CreateDisputeRequest = {
        order,
        reason: values.reason,
        description: values.description,
      };
      return api.post<Dispute>("disputes/", body);
    },
    onSuccess: () => invalidate.disputeCreated(qc),
  });
}
