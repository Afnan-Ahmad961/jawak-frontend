"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type { Id, Notification } from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";

/**
 * Notifications drive live UX across every screen. No websockets, so the bell
 * polls (Overview.md §Notifications). Marking read clears the badge.
 */

const POLL_MS = 30_000;

export function useNotifications(opts: { unread?: boolean } = {}) {
  const params = opts.unread ? { unread: true } : undefined;
  return useQuery({
    queryKey: queryKeys.notifications.list(opts),
    queryFn: async () =>
      unwrapList<Notification>(await api.get("notifications/", params)),
    refetchInterval: POLL_MS,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: Id) => api.post<null>(`notifications/${id}/read/`),
    onSuccess: () => invalidate.notificationsRead(qc),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<null>("notifications/read-all/"),
    onSuccess: () => invalidate.notificationsRead(qc),
  });
}
