"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/http";

/**
 * Inline error for a failed query inside a page (distinct from the route-level
 * error.tsx boundary). Surfaces the real API detail, not a generic message
 * (AGENTS.md → Error & loading).
 */
export function DataError({
  error,
  onRetry,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong loading this.";

  return (
    <div
      className={
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 px-6 py-10 text-center " +
        (className ?? "")
      }
    >
      <HugeiconsIcon
        icon={Alert02Icon}
        className="text-destructive size-6"
        strokeWidth={1.5}
      />
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <HugeiconsIcon icon={RefreshIcon} />
          Try again
        </Button>
      )}
    </div>
  );
}
