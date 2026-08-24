"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { Bid, BidStatus, BidStatusUpdate, Id } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";

/**
 * Bids. `GET bids/?request=<id>` lists the bids on a request (client compare
 * view); `GET bids/` with no param lists the vendor's own bids. Accepting a bid
 * cascades: it rejects the siblings AND creates the order (Overview.md §5).
 */

export function useRequestBids(requestId: Id) {
  return useQuery({
    queryKey: queryKeys.bids.list({ request: requestId }),
    queryFn: async () =>
      unwrapList<Bid>(await api.get("bids/", { request: requestId })),
    enabled: requestId !== undefined && requestId !== null && requestId !== "",
  });
}

/** The signed-in vendor's own bids (no request filter). */
export function useMyBids() {
  return useQuery({
    queryKey: queryKeys.bids.list({ mine: true }),
    queryFn: async () => unwrapList<Bid>(await api.get("bids/")),
  });
}

export function useSetBidStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: Id; status: BidStatus }) => {
      const body: BidStatusUpdate = { status };
      return api.patch<Bid>(`bids/${id}/status/`, body);
    },
    // Accepting has the biggest fan-out; rejecting only touches bids, but
    // invalidating the full cascade is cheap and always correct.
    onSuccess: () => invalidate.bidAccepted(qc),
  });
}

export function useWithdrawBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) => api.post<Bid>(`bids/${id}/withdraw/`),
    onSuccess: () => invalidate.bidWithdrawn(qc),
  });
}
