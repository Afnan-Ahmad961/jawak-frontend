import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { VendorSummary } from "@/components/shared/vendor-summary";
import { asObjectRef } from "@/lib/api/refs";
import { formatDate } from "@/lib/format";
import { productionStageMeta } from "@/lib/labels";
import type {
  DesignRequest,
  Order,
  VendorSummary as VendorSummaryType,
} from "@/lib/api/types";

/** Summary tile for an awarded order in the client's list. */
export function OrderCard({ order }: { order: Order }) {
  const request = asObjectRef<DesignRequest>(order.design_request);
  const vendor = asObjectRef<VendorSummaryType>(order.vendor);
  const stage = order.current_stage
    ? productionStageMeta[order.current_stage]?.label
    : null;

  return (
    <Link
      href={`/client/orders/${order.id}`}
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

          <VendorSummary vendor={vendor} />

          <div className="text-muted-foreground flex items-center justify-between text-xs">
            {stage ? (
              <span className="capitalize">Stage: {stage}</span>
            ) : (
              <span>Not started</span>
            )}
            {order.created_at && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Calendar03Icon} className="size-3.5" />
                {formatDate(order.created_at)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
