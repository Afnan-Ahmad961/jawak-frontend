"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useLogout, useSession } from "@/lib/hooks/use-session";

/**
 * Top bar shared by every role dashboard. `title` names the current workspace;
 * the role badge and user come from the session.
 */
export function AppHeader({ title }: { title: string }) {
  const { user, role } = useSession();
  const logout = useLogout();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold tracking-tight">Jawak</span>
        <span className="text-muted-foreground text-sm">/ {title}</span>
        {role && (
          <Badge variant="secondary" className="capitalize">
            {role}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        {user?.email && (
          <span className="text-muted-foreground mr-2 hidden text-xs sm:inline">
            {user.email}
          </span>
        )}
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
