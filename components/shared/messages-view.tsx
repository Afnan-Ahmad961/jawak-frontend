"use client";

import { useEffect } from "react";
import { useQueryState } from "nuqs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Message01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { ConversationList } from "@/components/shared/conversation-list";
import { ChatPanel } from "@/components/shared/chat-panel";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import {
  conversationCounterpartyName,
  type ChatPerspective,
} from "@/lib/conversation";
import { useConversations } from "@/lib/hooks/use-conversations";
import type { Id } from "@/lib/api/types";

/**
 * Two-pane messaging shared by client and vendor. `perspective` decides which
 * party is shown as the counterparty. The active thread id lives in the URL
 * (`?c=<id>`) so a chat is deep-linkable; on mobile the panes swap.
 */
export function MessagesView({
  perspective,
  description,
}: {
  perspective: ChatPerspective;
  description: string;
}) {
  const [active, setActive] = useQueryState("c");
  const { data: conversations = [], isLoading, isError, error, refetch } =
    useConversations();

  const activeConversation = conversations.find((c) => String(c.id) === active);
  // Drive the mobile pane switch from the *resolved* conversation, not the raw
  // `?c=` value — a stale/invalid id would otherwise hide both panes.
  const showChat = Boolean(activeConversation);

  // Clear a `?c=` that doesn't match any thread once the list has loaded.
  useEffect(() => {
    if (active && !isLoading && !activeConversation) {
      setActive(null);
    }
  }, [active, isLoading, activeConversation, setActive]);

  const select = (id: Id) => setActive(String(id));

  return (
    <div className="space-y-4">
      <PageHeader title="Messages" description={description} />

      {isLoading ? (
        <Skeleton className="h-[32rem] w-full" />
      ) : isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={Message01Icon}
          title="No conversations yet"
          description={
            perspective === "client"
              ? "Start a chat from a bid on one of your requests to negotiate price and timeline."
              : "Start a chat from a job on the board to negotiate with the client."
          }
        />
      ) : (
        <Card className="h-[32rem] overflow-hidden p-0">
          <div className="grid h-full md:grid-cols-[18rem_1fr]">
            {/* Thread list — hidden on mobile when a chat is open */}
            <div
              className={cn(
                "h-full overflow-y-auto border-border md:border-r",
                showChat && "hidden md:block",
              )}
            >
              <ConversationList
                conversations={conversations}
                activeId={activeConversation?.id ?? null}
                perspective={perspective}
                onSelect={select}
              />
            </div>

            {/* Chat pane */}
            <div className={cn("h-full", !showChat && "hidden md:block")}>
              {activeConversation ? (
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="md:hidden"
                      aria-label="Back to conversations"
                      onClick={() => setActive(null)}
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} />
                    </Button>
                    <Avatar size="sm">
                      <AvatarFallback>
                        {initials(
                          conversationCounterpartyName(
                            activeConversation,
                            perspective,
                          ),
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium">
                      {conversationCounterpartyName(
                        activeConversation,
                        perspective,
                      )}
                    </span>
                  </div>
                  <div className="min-h-0 flex-1">
                    <ChatPanel conversationId={activeConversation.id} />
                  </div>
                </div>
              ) : (
                <div className="hidden h-full items-center justify-center md:flex">
                  <p className="text-muted-foreground text-xs">
                    Select a conversation to start chatting.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
