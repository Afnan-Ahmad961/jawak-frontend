"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  File01Icon,
  TagIcon,
  PackageIcon,
  Store01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { DataError } from "@/components/shared/data-error";
import { StarRating } from "@/components/shared/star-rating";
import {
  BreakdownBars,
  type BreakdownEntry,
} from "@/components/admin/analytics/breakdown-bars";
import { apparelLabel } from "@/lib/labels";
import { formatMoney } from "@/lib/format";
import { useAnalyticsOverview } from "@/lib/hooks/use-analytics";
import type {
  AnalyticsBreakdown,
  AnalyticsOverview,
  Money,
} from "@/lib/api/types";

/** Normalize a breakdown that may be a { key: count } map or a [{...,count}] list. */
function normalizeBreakdown(breakdown?: AnalyticsBreakdown): BreakdownEntry[] {
  if (!breakdown) return [];
  const entries = Array.isArray(breakdown)
    ? breakdown.map((item) => ({
        label: String(item.label ?? item.key ?? ""),
        count: Number(item.count ?? 0),
      }))
    : Object.entries(breakdown).map(([label, count]) => ({
        label,
        count: Number(count),
      }));
  return entries
    .filter((e) => e.label)
    .sort((a, b) => b.count - a.count);
}

function total(data: AnalyticsOverview, key: keyof NonNullable<AnalyticsOverview["totals"]>): number | undefined {
  const flat = data[`total_${key}` as keyof AnalyticsOverview];
  return data.totals?.[key] ?? (typeof flat === "number" ? flat : undefined);
}

function formatRate(value?: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  // `dispute_rate` is a fraction in [0, 1] (see AnalyticsOverview) → percent.
  return `${(value * 100).toFixed(1)}%`;
}

function formatRatio(value?: number): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function AnalyticsView() {
  const { data, isLoading, isError, error, refetch } = useAnalyticsOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace overview"
        description="Volume metrics across the marketplace. (No revenue figures yet.)"
      />

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : isError || !data ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : (
        <AnalyticsContent data={data} />
      )}
    </div>
  );
}

function AnalyticsContent({ data }: { data: AnalyticsOverview }) {
  const apparelBreakdown = normalizeBreakdown(data.requests_by_apparel_type);
  const orderStatusBreakdown = normalizeBreakdown(data.orders_by_status);
  const topVendors = data.top_vendors ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile icon={File01Icon} label="Requests" value={total(data, "requests")} />
        <StatTile icon={TagIcon} label="Bids" value={total(data, "bids")} />
        <StatTile icon={PackageIcon} label="Orders" value={total(data, "orders")} />
        <StatTile icon={Store01Icon} label="Vendors" value={total(data, "vendors")} />
        <StatTile icon={Alert02Icon} label="Disputes" value={total(data, "disputes")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Avg. bid amount" value={formatMoneyMetric(data.average_bid_amount)} />
        <MetricCard label="Bids per request" value={formatRatio(data.bids_per_request)} />
        <MetricCard label="Dispute rate" value={formatRate(data.dispute_rate)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BreakdownBars
          title="Requests by apparel type"
          entries={apparelBreakdown}
          formatLabel={apparelLabel}
        />
        <BreakdownBars
          title="Orders by status"
          entries={orderStatusBreakdown}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top vendors</CardTitle>
        </CardHeader>
        <CardContent>
          {topVendors.length === 0 ? (
            <p className="text-muted-foreground text-xs">No vendor data yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {topVendors.map((vendor, index) => (
                <li
                  key={vendor.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-muted-foreground w-4 text-xs tabular-nums">
                      {index + 1}
                    </span>
                    <span className="truncate text-xs font-medium">
                      {vendor.company_name ?? `Vendor #${vendor.id}`}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    {typeof vendor.avg_rating === "number" &&
                      vendor.avg_rating > 0 && (
                        <StarRating
                          value={vendor.avg_rating}
                          count={vendor.review_count ?? undefined}
                          size="sm"
                        />
                      )}
                    {typeof vendor.order_count === "number" && (
                      <span className="text-muted-foreground text-xs">
                        {vendor.order_count} orders
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatMoneyMetric(value?: Money): string {
  return value === null || value === undefined ? "—" : formatMoney(value);
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement;
  label: string;
  value?: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
          <HugeiconsIcon icon={icon} className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-semibold tracking-tight tabular-nums">
            {value ?? "—"}
          </p>
          <p className="text-muted-foreground truncate text-xs">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1">
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-lg font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
