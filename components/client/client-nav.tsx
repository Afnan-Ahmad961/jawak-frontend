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
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * Primary section nav for the customer dashboard. Renders inline in the header
 * on desktop and as a scrollable row on small screens. Active state comes from
 * the current path (exact for the dashboard root, prefix for sections).
 */

const LINKS: { href: string; label: string; icon: IconSvgElement; exact?: boolean }[] =
  [
    { href: "/client", label: "Dashboard", icon: DashboardSquare01Icon, exact: true },
    { href: "/client/requests", label: "Requests", icon: File01Icon },
    { href: "/client/orders", label: "Orders", icon: PackageIcon },
    { href: "/client/vendors", label: "Vendors", icon: Store01Icon },
    { href: "/client/messages", label: "Messages", icon: Message01Icon },
  ];

export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0.5 overflow-x-auto">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <HugeiconsIcon icon={link.icon} className="size-3.5" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
