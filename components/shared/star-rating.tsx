"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

/**
 * Star display. Read-only by default; pass `onChange` to make it an input (used
 * by the review form). Uses `fill` to show filled vs. empty against the token
 * palette — no hardcoded colors.
 */

export function StarRating({
  value,
  count,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  /** Optional "(N)" count shown after the stars, for read displays. */
  count?: number | null;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const interactive = typeof onChange === "function";
  const px = size === "sm" ? "size-3" : size === "lg" ? "size-5" : "size-4";

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value);
        const star_el = (
          <HugeiconsIcon
            icon={StarIcon}
            className={cn(px, filled ? "text-primary" : "text-muted-foreground/40")}
            // Filled stars get a solid fill; empty ones stay outline.
            style={filled ? { fill: "currentColor" } : undefined}
          />
        );
        return interactive ? (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange?.(star)}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            {star_el}
          </button>
        ) : (
          <span key={star} aria-hidden>
            {star_el}
          </span>
        );
      })}
      {typeof count === "number" && (
        <span className="text-muted-foreground ml-1 text-xs">({count})</span>
      )}
    </div>
  );
}
