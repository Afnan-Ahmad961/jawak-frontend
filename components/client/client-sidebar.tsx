"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  PackageIcon,
  Store01Icon,
  Message01Icon,
  File01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/hooks/use-session";
import { mediaUrl } from "@/lib/media";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Customer navigation model — shared by the desktop rail and the mobile drawer.
 * `exact` matches only the dashboard root; the rest match their section prefix.
 */
export type NavLink = {
  href: string;
  label: string;
  icon: IconSvgElement;
  exact?: boolean;
};

export const CLIENT_NAV_LINKS: NavLink[] = [
  { href: "/client", label: "Dashboard", icon: DashboardSquare01Icon, exact: true },
  { href: "/client/requests", label: "Requests", icon: File01Icon },
  { href: "/client/orders", label: "Orders", icon: PackageIcon },
  { href: "/client/vendors", label: "Vendors", icon: Store01Icon },
  { href: "/client/messages", label: "Messages", icon: Message01Icon },
];

export function isNavActive(pathname: string, link: NavLink): boolean {
  return link.exact
    ? pathname === link.href
    : pathname === link.href || pathname.startsWith(`${link.href}/`);
}

/**
 * The sidebar's inner content: brand, a primary create action, section links,
 * and the signed-in user. Rendered in the fixed desktop rail and, on mobile,
 * inside a drawer — `onNavigate` lets the drawer close itself on a link tap.
 */
export function ClientSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useSession();

  const displayName = user?.name || user?.username || "Your account";

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <span
          aria-hidden
          className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
        >
          J
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold tracking-tight">Jawak</p>
          <p className="text-muted-foreground truncate text-[0.6875rem]">
            Customer workspace
          </p>
        </div>
      </div>

      {/* Primary action */}
      <div className="px-3 pt-4">
        <Button
          className="w-full justify-center"
          size="lg"
          render={<Link href="/client/requests/new" />}
          onClick={onNavigate}
        >
          <HugeiconsIcon icon={PlusSignIcon} />
          New request
        </Button>
      </div>

      {/* Section links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="text-muted-foreground px-3 pb-1.5 text-[0.625rem] font-medium tracking-wider uppercase">
          Menu
        </p>
        {CLIENT_NAV_LINKS.map((link) => {
          const active = isNavActive(pathname, link);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <HugeiconsIcon icon={link.icon} className="size-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Signed-in user */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
          <Avatar size="sm">
            {user?.avatar && <AvatarImage src={mediaUrl(user.avatar)} alt="" />}
            <AvatarFallback>{initials(displayName || user?.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-xs font-medium">{displayName}</p>
            {user?.email && (
              <p className="text-muted-foreground truncate text-[0.6875rem]">
                {user.email}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            Client
          </Badge>
        </div>
      </div>
    </div>
  );
}
