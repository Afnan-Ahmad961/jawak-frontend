"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatRelative, initials } from "@/lib/format";
import { asObjectRef } from "@/lib/api/refs";
import type { Conversation, DesignRequest, Id, VendorSummary } from "@/lib/api/types";

/**
 * Selectable list of conversation threads. `activeId` highlights the open one;
 * `onSelect` swaps the chat panel. Used on the messages page.
 */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: Conversation[];
  activeId: Id | null;
  onSelect: (id: Id) => void;
}) {
  return (
    <ul className="divide-y divide-border">
      {conversations.map((c) => {
        const vendor = asObjectRef<VendorSummary>(c.vendor);
        const request = asObjectRef<DesignRequest>(c.design_request);
        const title = vendor?.company_name || "Vendor";
        const subtitle =
          c.last_message?.content || request?.title || "No messages yet";
        const active = c.id === activeId;

        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/50",
                active && "bg-muted",
              )}
            >
              <Avatar size="sm">
                <AvatarFallback>{initials(title)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium">{title}</span>
                  {c.last_message?.created_at && (
                    <span className="text-muted-foreground shrink-0 text-[0.625rem]">
                      {formatRelative(c.last_message.created_at)}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground truncate text-xs">
                  {subtitle}
                </p>
              </div>
              {typeof c.unread_count === "number" && c.unread_count > 0 && (
                <span className="bg-primary text-primary-foreground inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[0.5rem] leading-4 font-semibold">
                  {c.unread_count}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
