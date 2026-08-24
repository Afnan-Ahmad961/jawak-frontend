"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import { useLogout, useSession } from "@/lib/hooks/use-session";

/**
 * Top bar shared by every role dashboard. `title` names the current workspace;
 * the role badge and user come from the session. The notification bell polls for
 * every role. `children` renders inline nav (e.g. the client's section links).
 */
export function AppHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const { user, role } = useSession();
  const logout = useLogout();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="text-sm font-semibold tracking-tight">Jawak</span>
        <span className="text-muted-foreground hidden text-sm sm:inline">
          / {title}
        </span>
        {role && (
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
        )}
        {children}
      </div>

      <div className="flex items-center gap-1">
        {user?.email && (
          <span className="text-muted-foreground mr-2 hidden text-xs md:inline">
            {user.email}
          </span>
        )}
        <NotificationBell />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sign out"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <HugeiconsIcon icon={Logout03Icon} />
        </Button>
      </div>
    </header>
  );
}
