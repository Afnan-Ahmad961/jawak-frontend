"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { PackageIcon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DataError } from "@/components/shared/data-error";
import { StatusFilter } from "@/components/shared/status-filter";
import { OrderCard } from "@/components/client/orders/order-card";
import { useOrders } from "@/lib/hooks/use-orders";
import { orderStatusMeta } from "@/lib/labels";
import type { OrderStatus } from "@/lib/api/types";

const STATUS_VALUES = Object.keys(orderStatusMeta) as OrderStatus[];
const STATUS_OPTIONS = STATUS_VALUES.map((value) => ({
  value,
  label: orderStatusMeta[value].label,
}));

/** The client's awarded orders, filterable by status (URL-backed). */
export function OrdersView() {
  const [status, setStatus] = useQueryState(
    "status",
    parseAsStringLiteral(STATUS_VALUES),
  );

  const { data: orders = [], isLoading, isError, error, refetch } = useOrders({
    status,
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Your orders"
        description="Track production and confirm delivery on awarded jobs."
      />

      <StatusFilter
        value={status}
        onChange={setStatus}
        options={STATUS_OPTIONS}
        allLabel="All statuses"
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <DataError error={error} onRetry={() => refetch()} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title={status ? "No orders with this status" : "No orders yet"}
          description={
            status
              ? "Try a different status filter."
              : "Once you accept a bid on a request, the order appears here."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
