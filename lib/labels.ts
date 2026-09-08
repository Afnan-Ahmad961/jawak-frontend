import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type {
  BidStatus,
  DisputeStatus,
  OrderStatus,
  ProductionStage,
  RequestStatus,
} from "@/lib/api/types";

/**
 * Human labels + badge variants for every status union and the apparel taxonomy.
 * Centralizing the status → variant mapping keeps semantic color out of
 * components (ground rule: no hardcoded colors) — badges only ever use the
 * theme-token variants shadcn ships.
 */

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

type StatusMeta = { label: string; variant: BadgeVariant };

export const requestStatusMeta: Record<RequestStatus, StatusMeta> = {
  open: { label: "Open", variant: "default" },
  awarded: { label: "Awarded", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

export const bidStatusMeta: Record<BidStatus, StatusMeta> = {
  pending: { label: "Pending", variant: "secondary" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
};

export const orderStatusMeta: Record<OrderStatus, StatusMeta> = {
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  disputed: { label: "Disputed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export const disputeStatusMeta: Record<DisputeStatus, StatusMeta> = {
  open: { label: "Open", variant: "default" },
  under_review: { label: "Under review", variant: "secondary" },
  resolved: { label: "Resolved", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export const productionStageMeta: Record<ProductionStage, StatusMeta> = {
  sourcing: { label: "Sourcing", variant: "secondary" },
  cutting: { label: "Cutting", variant: "secondary" },
  sewing: { label: "Sewing", variant: "secondary" },
  quality_check: { label: "Quality check", variant: "secondary" },
  shipped: { label: "Shipped", variant: "default" },
  delivered: { label: "Delivered", variant: "default" },
};

/** Ordered stage list with labels for rendering a production timeline. */
export const PRODUCTION_STAGE_STEPS: { value: ProductionStage; label: string }[] =
  [
    { value: "sourcing", label: "Sourcing" },
    { value: "cutting", label: "Cutting" },
    { value: "sewing", label: "Sewing" },
    { value: "quality_check", label: "Quality check" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ];

/**
 * Apparel taxonomy for the request form's select. Value = API string; these
 * must match the backend's `ApparelType` choices exactly (a value the API
 * rejects would fail on submit). Source of truth:
 *   hoodie · jacket · tshirt · football_kit · other
 */
export const APPAREL_TYPES: { value: string; label: string }[] = [
  { value: "tshirt", label: "T-Shirt" },
  { value: "hoodie", label: "Hoodie" },
  { value: "jacket", label: "Jacket" },
  { value: "football_kit", label: "Football Kit" },
  { value: "other", label: "Other" },
];

const APPAREL_LABEL = new Map(APPAREL_TYPES.map((a) => [a.value, a.label]));

/** Best-effort label for an apparel value the API may send in any casing. */
export function apparelLabel(value?: string | null): string {
  if (!value) return "—";
  // Normalize casing/separators so "T_SHIRT" or "t shirt" still map to "T-shirt".
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");
  return (
    APPAREL_LABEL.get(normalized) ??
    value
      .split(/[_\s]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );
}
