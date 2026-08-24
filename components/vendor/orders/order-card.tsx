import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, UserIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { asObjectRef } from "@/lib/api/refs";
import { formatDate } from "@/lib/format";
import { productionStageMeta } from "@/lib/labels";
import type { DesignRequest, Order, UserSummary } from "@/lib/api/types";

/** Summary tile for an assigned order in the vendor's list (shows the client). */
export function OrderCard({ order }: { order: Order }) {
  const request = asObjectRef<DesignRequest>(order.design_request);
  const client = asObjectRef<UserSummary>(order.client);
  const clientName =
    client?.name || client?.username || client?.email || "Client";
  const stage = order.current_stage
    ? productionStageMeta[order.current_stage]?.label
    : null;

  return (
    <Link
      href={`/vendor/orders/${order.id}`}
      className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-medium">
              {request?.title ?? `Order #${order.id}`}
            </p>
            <StatusBadge kind="order" value={order.status} />
          </div>

          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <HugeiconsIcon icon={UserIcon} className="size-3.5" />
            {clientName}
          </p>

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            {stage ? (
              <span className="capitalize">Stage: {stage}</span>
            ) : (
              <span>Not started</span>
            )}
            {order.deadline && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                {formatDate(order.deadline)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
