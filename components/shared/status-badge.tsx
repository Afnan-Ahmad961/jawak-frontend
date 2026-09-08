import { Badge } from "@/components/ui/badge";
import type {
  BidStatus,
  DisputeStatus,
  OrderStatus,
  ProductionStage,
  RequestStatus,
} from "@/lib/api/types";
import {
  bidStatusMeta,
  disputeStatusMeta,
  orderStatusMeta,
  productionStageMeta,
  requestStatusMeta,
} from "@/lib/labels";

/**
 * One badge for any status union. Label + variant come from lib/labels.ts, so
 * status color stays centralized (no palette classes in components). Falls back
 * to an outline badge with a titleized string if the API sends something new.
 */

type StatusBadgeProps =
  | { kind: "request"; value: RequestStatus }
  | { kind: "bid"; value: BidStatus }
  | { kind: "order"; value: OrderStatus }
  | { kind: "stage"; value: ProductionStage }
  | { kind: "dispute"; value: DisputeStatus };

const META = {
  request: requestStatusMeta,
  bid: bidStatusMeta,
  order: orderStatusMeta,
  stage: productionStageMeta,
  dispute: disputeStatusMeta,
} as const;

export function StatusBadge({ kind, value }: StatusBadgeProps) {
  const meta = (META[kind] as Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }>)[
    value
  ];
  if (!meta) {
    return (
      <Badge variant="outline" className="capitalize">
        {String(value).replace(/_/g, " ")}
      </Badge>
    );
  }
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
