"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type {
  CreateProductionUpdateRequest,
  Id,
  Order,
  OrderStatus,
  ProductionUpdate,
} from "@/lib/api/types";
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

/**
 * Vendor posts a production milestone. Multipart (an optional photo), so the
 * body is FormData. Stages only move forward — Django enforces the order.
 */
export function useAddProductionUpdate(id: Id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProductionUpdateRequest) => {
      const fd = new FormData();
      fd.set("stage", input.stage);
      if (input.note) fd.set("note", input.note);
      if (input.image instanceof File) fd.set("image", input.image);
      return api.post<ProductionUpdate>(`orders/${id}/production-updates/`, fd);
    },
    onSuccess: async () => {
      await invalidate.productionUpdated(qc);
      await qc.invalidateQueries({ queryKey: queryKeys.orders.detail(id) });
    },
  });
}
