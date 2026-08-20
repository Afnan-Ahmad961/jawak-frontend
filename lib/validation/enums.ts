import { z } from "zod";

/**
 * Zod mirrors of the API's status unions (see lib/api/types.ts). Forms and
 * response guards share these so the string literals live in exactly one place.
 */
export const requestStatus = z.enum([
  "open",
  "awarded",
  "closed",
  "cancelled",
]);
export const bidStatus = z.enum([
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);
export const orderStatus = z.enum([
  "active",
  "completed",
  "disputed",
  "cancelled",
]);
export const productionStage = z.enum([
  "sourcing",
  "cutting",
  "sewing",
  "quality_check",
  "shipped",
  "delivered",
]);
export const disputeStatus = z.enum([
  "open",
  "under_review",
  "resolved",
  "rejected",
]);
