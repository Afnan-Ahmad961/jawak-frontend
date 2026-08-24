"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/http";
import { unwrapList } from "@/lib/api/pagination";
import type {
  Conversation,
  Id,
  Message,
  SendMessageRequest,
  StartConversationRequest,
} from "@/lib/api/types";
import { queryKeys } from "@/lib/query/keys";
import { invalidate } from "@/lib/query/invalidation";

/**
 * Client ↔ vendor negotiation chat. No websockets on the API, so the open
 * thread polls (Overview.md). A conversation is scoped to a {design_request,
 * vendor} pair; starting one is idempotent-ish on the backend.
 */

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: async () =>
      unwrapList<Conversation>(await api.get("conversations/")),
  });
}

export function useMessages(conversationId: Id | null) {
  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId ?? "none"),
    queryFn: async () =>
      unwrapList<Message>(
        await api.get(`conversations/${conversationId}/messages/`),
      ),
    enabled:
      conversationId !== null &&
      conversationId !== undefined &&
      conversationId !== "",
    // Poll the open thread — the API has no realtime channel.
    refetchInterval: 15_000,
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: StartConversationRequest) =>
      api.post<Conversation>("conversations/", input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.conversations.list() }),
  });
}

export function useSendMessage(conversationId: Id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => {
      const payload: SendMessageRequest = { body: content };
      return api.post<Message>(
        `conversations/${conversationId}/messages/`,
        payload,
      );
    },
    onSuccess: () => invalidate.messageSent(qc, conversationId),
  });
}
