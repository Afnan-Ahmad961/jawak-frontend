"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  File01Icon,
  PackageIcon,
  CheckmarkCircle02Icon,
  PlusSignIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { StatusBadge } from "@/components/shared/status-badge";
import { VendorSummary } from "@/components/shared/vendor-summary";
import { useSession } from "@/lib/hooks/use-session";
import { useRequests } from "@/lib/hooks/use-requests";
import { useOrders } from "@/lib/hooks/use-orders";
import { asObjectRef } from "@/lib/api/refs";
import { apparelLabel } from "@/lib/labels";
import { formatQuantity } from "@/lib/format";
import type {
  DesignRequest,
  VendorSummary as VendorSummaryType,
} from "@/lib/api/types";

/** Customer home: at-a-glance stats + recent requests and orders. */
export function DashboardView() {
  const { user } = useSession();
  const requestsQuery = useRequests();
  const ordersQuery = useOrders();

  const requests = requestsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];

  const openRequests = requests.filter((r) => r.status === "open").length;
  const activeOrders = orders.filter((o) => o.status === "active").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;

  const displayName = user?.name || user?.username;
  const greeting = displayName ? `Welcome back, ${displayName}` : "Welcome back";

  return (
    <div className="space-y-6">
      <PageHeader
        title={greeting}
        description="Post apparel jobs, compare bids, and track production."
        actions={
          <Button render={<Link href="/client/requests/new" />}>
            <HugeiconsIcon icon={PlusSignIcon} />
            New request
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={File01Icon}
          label="Total requests"
          value={requests.length}
          loading={requestsQuery.isLoading}
          unavailable={requestsQuery.isError}
          href="/client/requests"
        />
        <StatTile
          icon={File01Icon}
          label="Open requests"
          value={openRequests}
          loading={requestsQuery.isLoading}
          unavailable={requestsQuery.isError}
          href="/client/requests?status=open"
        />
        <StatTile
          icon={PackageIcon}
          label="Active orders"
          value={activeOrders}
          loading={ordersQuery.isLoading}
          unavailable={ordersQuery.isError}
          href="/client/orders?status=active"
        />
        <StatTile
          icon={CheckmarkCircle02Icon}
          label="Completed orders"
          value={completedOrders}
          loading={ordersQuery.isLoading}
          unavailable={ordersQuery.isError}
          href="/client/orders?status=completed"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentRequests
          requests={requests}
          loading={requestsQuery.isLoading}
          isError={requestsQuery.isError}
          error={requestsQuery.error}
          onRetry={() => requestsQuery.refetch()}
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
      className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full transition-colors group-hover:bg-muted/40">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <HugeiconsIcon icon={icon} className="size-5" />
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="text-muted-foreground size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
            />
          </div>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-8 w-12" />
            ) : unavailable ? (
              // Don't render a real "0" when the fetch failed — that would
              // report unavailable data as a genuine count.
              <p
                className="text-muted-foreground text-3xl font-semibold tracking-tight"
                title="Couldn't load this figure"
              >
                —
              </p>
            ) : (
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {value}
              </p>
            )}
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {label}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentRequests({
  requests,
  loading,
  isError,
  error,
  onRetry,
}: {
  requests: DesignRequest[];
  loading: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  const recent = requests.slice(0, 4);
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent requests</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/client/requests" />}
        >
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
            title="No requests yet"
            description="Post your first design request to start receiving bids."
          />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/client/requests/${request.id}`}
                  className="flex items-center justify-between gap-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {request.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {apparelLabel(request.apparel_type)} ·{" "}
                      {formatQuantity(request.quantity)}
                    </p>
                  </div>
                  <StatusBadge kind="request" value={request.status} />
                </Link>
              </li>
            ))}
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
  orders: import("@/lib/api/types").Order[];
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
        <Button variant="ghost" size="sm" render={<Link href="/client/orders" />}>
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
            title="No orders yet"
            description="Accept a bid on a request to create your first order."
          />
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((order) => {
              const request = asObjectRef<DesignRequest>(order.design_request);
              const vendor = asObjectRef<VendorSummaryType>(order.vendor);
              return (
                <li key={order.id}>
                  <Link
                    href={`/client/orders/${order.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {request?.title ?? `Order #${order.id}`}
                      </p>
                      <VendorSummary vendor={vendor} showRating={false} />
                    </div>
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
