"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format";
import type { Notification } from "@/lib/api/types";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/hooks/use-notifications";

/**
 * Notification bell shared by every role dashboard. Polls the notifications
 * endpoint (no websockets), shows an unread badge, and lets the user mark items
 * read individually or all at once.
 */
export function NotificationBell() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = notifications.filter((n) => !n.read);
  const unreadCount = unread.length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications" />
        }
      >
        <span className="relative inline-flex">
          <HugeiconsIcon icon={Notification01Icon} />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[0.5rem] leading-4 font-semibold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-xs">
              Loading…
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-xs">
              You&apos;re all caught up.
            </p>
          ) : (
            notifications.slice(0, 20).map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                onRead={() => !n.read && markRead.mutate(n.id)}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  const body = (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-1 size-1.5 shrink-0 rounded-full",
          notification.read ? "bg-transparent" : "bg-primary",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        {notification.title && (
          <p className="truncate text-xs font-medium">{notification.title}</p>
        )}
        <p className="text-muted-foreground text-xs">{notification.message}</p>
        <p className="text-muted-foreground/70 text-[0.625rem]">
          {formatRelative(notification.created_at)}
        </p>
      </div>
    </div>
  );

  const className = cn(
    "block w-full px-3 py-2 text-left transition-colors hover:bg-muted/50",
    !notification.read && "bg-muted/30",
  );

  // Link out when the notification carries a target; otherwise it's just a
  // "mark read" affordance.
  if (notification.link) {
    return (
      <Link href={notification.link} className={className} onClick={onRead}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onRead}>
      {body}
    </button>
  );
}
