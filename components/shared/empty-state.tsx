import type { ReactNode } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

/**
 * Friendly "nothing here yet" block for empty lists. Optional action slot for a
 * primary CTA (e.g. "Post a request").
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: IconSvgElement;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <div className="text-muted-foreground">
          <HugeiconsIcon icon={icon} className="size-8" strokeWidth={1.5} />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-sm text-xs">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
