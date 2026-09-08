import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export type BreakdownEntry = { label: string; count: number };

/**
 * Simple horizontal bar breakdown (e.g. orders-by-status). Bar widths are
 * relative to the largest value; color is the theme primary token only.
 */
export function BreakdownBars({
  title,
  entries,
  formatLabel,
}: {
  title: string;
  entries: BreakdownEntry[];
  formatLabel?: (label: string) => string;
}) {
  const max = entries.reduce((m, e) => Math.max(m, e.count), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <EmptyState title="No data yet" />
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => {
              const pct = max > 0 ? Math.round((entry.count / max) * 100) : 0;
              return (
                <li key={entry.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize">
                      {formatLabel
                        ? formatLabel(entry.label)
                        : entry.label.replace(/_/g, " ")}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {entry.count}
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                    role="presentation"
                  >
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
