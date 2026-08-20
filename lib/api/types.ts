import type { Role } from "@/lib/config";

/**
 * Domain types mirrored from the Django API (see Overview.md). These are the
 * shapes the frontend relies on; extend them as endpoints are wired up. Status
 * unions match the exact strings the API renders.
 */

export type RequestStatus = "open" | "awarded" | "closed" | "cancelled";
export type BidStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type OrderStatus = "active" | "completed" | "disputed" | "cancelled";
export type ProductionStage =
  | "sourcing"
  | "cutting"
  | "sewing"
  | "quality_check"
  | "shipped"
  | "delivered";
export type DisputeStatus = "open" | "under_review" | "resolved" | "rejected";

export const PRODUCTION_STAGES: ProductionStage[] = [
  "sourcing",
  "cutting",
  "sewing",
  "quality_check",
  "shipped",
  "delivered",
];

export type User = {
  id: number | string;
  email: string;
  role: Role;
  name?: string;
  avatar?: string | null;
};
