"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Logout03Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/components/shared/notification-bell";
import {
  ClientSidebar,
  CLIENT_NAV_LINKS,
  isNavActive,
} from "@/components/client/client-sidebar";
import { useLogout } from "@/lib/hooks/use-session";

/** The section name for the current route, for the top bar heading. */
function useSectionTitle(): string {
  const pathname = usePathname();
  const match =
    CLIENT_NAV_LINKS.find((link) => !link.exact && isNavActive(pathname, link)) ??
    CLIENT_NAV_LINKS.find((link) => link.exact && isNavActive(pathname, link));
  return match?.label ?? "Dashboard";
}

/**
 * Top bar for the customer workspace: a drawer trigger + current section on the
 * left (the brand lives in the sidebar), and account controls on the right. The
 * drawer reuses the same {@link ClientSidebar} as the desktop rail.
 */
export function ClientTopbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const title = useSectionTitle();
  const logout = useLogout();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <HugeiconsIcon icon={Menu01Icon} />
        </Button>
        <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <ClientSidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
