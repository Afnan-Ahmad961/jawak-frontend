"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/http";

/**
 * Reusable body for a route segment's `error.tsx` boundary. Each segment's
 * error.tsx is a thin Client Component that renders this with its `{ error,
 * reset }`. Surfaces the real message (ApiError.detail) per AGENTS.md.
 */
export function RouteError({
  error,
  reset,
  title = "Couldn't load this page",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    // Log for observability; the user sees the friendly message below.
    console.error(error);
  }, [error]);

  const message =
    error instanceof ApiError
      ? error.message
      : error.message || "An unexpected error occurred.";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 py-16 text-center">
      <HugeiconsIcon
        icon={Alert02Icon}
        className="text-destructive size-7"
        strokeWidth={1.5}
      />
      <div className="space-y-1">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-muted-foreground text-xs">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        <HugeiconsIcon icon={RefreshIcon} />
        Try again
      </Button>
    </div>
  );
}
