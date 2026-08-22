"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { Id, Order, OrderStatus } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";

/** Orders: the awarded contract + production timeline. */

export type OrderFilters = { status?: OrderStatus | null };

export function useOrders(filters: OrderFilters = {}) {
  const params = filters.status ? { status: filters.status } : undefined;
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: async () => unwrapList<Order>(await api.get("orders/", params)),
  });
}

export function useOrder(id: Id) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => api.get<Order>(`orders/${id}/`),
    enabled: id !== undefined && id !== null && id !== "",
  });
}

export function useConfirmDelivery(id: Id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Order>(`orders/${id}/confirm-delivery/`),
    onSuccess: async () => {
      await invalidate.deliveryConfirmed(qc);
      await qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
    },
  });
}
