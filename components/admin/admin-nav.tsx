"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/** Primary section nav for the admin console. */

const LINKS: { href: string; label: string; icon: IconSvgElement; exact?: boolean }[] =
  [
    { href: "/admin", label: "Overview", icon: DashboardSquare01Icon, exact: true },
    { href: "/admin/disputes", label: "Disputes", icon: Alert02Icon },
  ];

export function AdminNav() {
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
