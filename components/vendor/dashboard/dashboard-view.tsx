"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  TagIcon,
  CheckmarkCircle02Icon,
  PackageIcon,
  Store01Icon,
  ArrowRight01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { useSession } from "@/lib/hooks/use-session";
import { useMyVendorProfile } from "@/lib/hooks/use-vendors";
import { useMyBids } from "@/lib/hooks/use-bids";
import { useOrders } from "@/lib/hooks/use-orders";
import { asObjectRef, refId } from "@/lib/api/refs";
import { formatMoney } from "@/lib/format";
import type { Bid, DesignRequest, Order } from "@/lib/api/types";

/** Vendor home: profile prompt (if none) + bid/order stats and recent activity. */
export function DashboardView() {
  const { user } = useSession();
  const profileQuery = useMyVendorProfile();
  const bidsQuery = useMyBids();
  const ordersQuery = useOrders();

  const bids = bidsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  const pendingBids = bids.filter((b) => b.status === "pending").length;
  const acceptedBids = bids.filter((b) => b.status === "accepted").length;
  const activeOrders = orders.filter((o) => o.status === "active").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const displayName = user?.name || user?.username;
  const greeting = displayName ? `Welcome back, ${displayName}` : "Welcome back";

  // Onboarding: no profile yet.
  if (!profileQuery.isLoading && !profileQuery.isError && !profileQuery.data) {
    return (
      <div className="space-y-6">
        <PageHeader title={greeting} />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <HugeiconsIcon
              icon={Store01Icon}
              className="text-muted-foreground size-8"
              strokeWidth={1.5}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">Set up your vendor profile</p>
              <p className="text-muted-foreground mx-auto max-w-sm text-xs">
                Create a profile to appear in the directory, get matched to jobs,
                and start bidding.
              </p>
            </div>
            <Button render={<Link href="/vendor/profile" />}>
              Create profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description="Discover jobs, place bids, and run production."
        actions={
          <Button variant="outline" render={<Link href="/vendor/jobs" />}>
            Browse jobs
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={TagIcon}
          label="Pending bids"
          value={pendingBids}
          loading={bidsQuery.isLoading}
          unavailable={bidsQuery.isError}
          href="/vendor/bids"
        />
        <StatTile
          icon={CheckmarkCircle02Icon}
          label="Accepted bids"
          value={acceptedBids}
          loading={bidsQuery.isLoading}
          unavailable={bidsQuery.isError}
          href="/vendor/bids"
        />
        <StatTile
          icon={PackageIcon}
          label="Active orders"
          value={activeOrders}
          loading={ordersQuery.isLoading}
          unavailable={ordersQuery.isError}
          href="/vendor/orders?status=active"
        />
        <StatTile
          icon={CheckmarkCircle02Icon}
          label="Completed orders"
          value={completedOrders}
          loading={ordersQuery.isLoading}
          unavailable={ordersQuery.isError}
          href="/vendor/orders?status=completed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentBids
          bids={bids}
          loading={bidsQuery.isLoading}
          isError={bidsQuery.isError}
          error={bidsQuery.error}
          onRetry={() => bidsQuery.refetch()}
        />
        <RecentOrders
          orders={orders}
          loading={ordersQuery.isLoading}
          isError={ordersQuery.isError}
          error={ordersQuery.error}
          onRetry={() => ordersQuery.refetch()}
        />
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  loading,
  unavailable = false,
  href,
}: {
  icon: IconSvgElement;
  label: string;
  value: number;
  loading: boolean;
  unavailable?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
            <HugeiconsIcon icon={icon} className="size-4" />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-6 w-10" />
            ) : unavailable ? (
              <p
                className="text-muted-foreground text-xl font-semibold tracking-tight"
                title="Couldn't load this figure"
              >
                —
              </p>
            ) : (
              <p className="text-xl font-semibold tracking-tight tabular-nums">
                {value}
              </p>
            )}
            <p className="text-muted-foreground truncate text-xs">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentBids({
  bids,
  loading,
  isError,
  error,
  onRetry,
}: {
  bids: Bid[];
  loading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  const recent = bids.slice(0, 4);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent bids</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/vendor/bids" />}>
          View all
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <DataError error={error} onRetry={onRetry} />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={Alert02Icon}
            title="No bids yet"
            description="Browse the job board and place your first bid."
          />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((bid) => {
              const request = asObjectRef<DesignRequest>(bid.design_request);
              const requestId = refId(bid.design_request);
              return (
                <li key={bid.id}>
                  <Link
                    href={`/vendor/jobs/${requestId}`}
                    className="flex items-center justify-between gap-2 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {request?.title ?? `Request #${requestId}`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatMoney(bid.proposed_price)} · {bid.delivery_days}d
                      </p>
                    </div>
                    <StatusBadge kind="bid" value={bid.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RecentOrders({
  orders,
  loading,
  isError,
  error,
  onRetry,
}: {
  orders: Order[];
  loading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  const recent = orders.slice(0, 4);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent orders</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/vendor/orders" />}>
          View all
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <DataError error={error} onRetry={onRetry} />
        ) : recent.length === 0 ? (
          <EmptyState
            icon={PackageIcon}
            title="No orders yet"
            description="Win a bid to start your first order."
          />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((order) => {
              const request = asObjectRef<DesignRequest>(order.design_request);
              return (
                <li key={order.id}>
                  <Link
                    href={`/vendor/orders/${order.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <p className="min-w-0 truncate text-xs font-medium">
                      {request?.title ?? `Order #${order.id}`}
                    </p>
                    <StatusBadge kind="order" value={order.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
