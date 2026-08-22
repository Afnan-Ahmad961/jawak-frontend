import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { PRODUCTION_STAGE_STEPS } from "@/lib/labels";
import { PRODUCTION_STAGES } from "@/lib/api/types";
import type { ProductionStage, ProductionUpdate } from "@/lib/api/types";

/**
 * Production progress for an order: the fixed 6-stage track (sourcing →
 * delivered) with completed/current markers, plus the chronological update feed
 * (note + optional photo per milestone). Shared — the vendor posts updates, both
 * sides read this.
 */
export function ProductionTimeline({
  currentStage,
  updates = [],
}: {
  currentStage?: ProductionStage | null;
  updates?: ProductionUpdate[];
}) {
  const currentIndex = currentStage
    ? PRODUCTION_STAGES.indexOf(currentStage)
    : -1;

  const feed = [...updates].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });

  return (
    <div className="space-y-6">
      {/* Stage track */}
      <ol className="flex flex-wrap gap-1">
        {PRODUCTION_STAGE_STEPS.map((step, i) => {
          const done = currentIndex >= 0 && i < currentIndex;
          const current = i === currentIndex;
          return (
            <li key={step.value} className="flex flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1 rounded-full",
                  done || current ? "bg-primary" : "bg-muted",
                )}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-[0.625rem]",
                  current
                    ? "text-foreground font-medium"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60",
                )}
              >
                {done && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="size-3"
                  />
                )}
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Update feed */}
      {feed.length > 0 ? (
        <ul className="space-y-4">
          {feed.map((update) => {
            const label =
              PRODUCTION_STAGE_STEPS.find((s) => s.value === update.stage)
                ?.label ?? update.stage;
            return (
              <li key={update.id} className="flex gap-3">
                <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium capitalize">
                      {label}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDateTime(update.created_at)}
                    </span>
                  </div>
                  {update.note && (
                    <p className="text-muted-foreground text-xs">
                      {update.note}
                    </p>
                  )}
                  {update.image && (
                    <div className="relative mt-1 aspect-video w-full max-w-xs overflow-hidden rounded-md border border-border bg-muted">
                      <Image
                        src={update.image}
                        alt={`${label} update`}
                        fill
                        sizes="20rem"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground text-xs">
          No production updates yet.
        </p>
      )}
    </div>
  );
}
