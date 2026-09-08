"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { SentIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { DataError } from "@/components/shared/data-error";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { refId } from "@/lib/api/refs";
import { ApiError } from "@/lib/api/http";
import { useSession } from "@/lib/hooks/use-session";
import { useMessages, useSendMessage } from "@/lib/hooks/use-conversations";
import { messageFormSchema, type MessageFormValues } from "@/lib/validation/message";
import type { Id } from "@/lib/api/types";

/**
 * The open chat thread for one conversation. Messages poll (no websockets); the
 * composer sends via the messaging endpoint and clears on success. Bubbles
 * align by whether the sender is the current user.
 */
export function ChatPanel({ conversationId }: { conversationId: Id }) {
  const { user } = useSession();
  const { data: messages = [], isLoading, isError, error, refetch } =
    useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: { content: "" },
  });

  // Keep the newest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const onSubmit = (values: MessageFormValues) => {
    // The input stays enabled during send, so Enter can re-fire — guard it.
    if (sendMessage.isPending) return;
    sendMessage.mutate(values.content, {
      onSuccess: () => form.reset({ content: "" }),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "Message failed to send",
        ),
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-10 w-3/5" />
          </div>
        ) : isError ? (
          <DataError error={error} onRetry={() => refetch()} />
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-xs">
            No messages yet — say hello.
          </p>
        ) : (
          messages.map((m) => {
            const mine =
              user?.id !== undefined && refId(m.sender) === user.id;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-2 text-xs",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[0.625rem]",
                      mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatDateTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-3">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center gap-2"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Type a message…" autoComplete="off" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send"
              disabled={sendMessage.isPending}
            >
              <HugeiconsIcon icon={SentIcon} />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
