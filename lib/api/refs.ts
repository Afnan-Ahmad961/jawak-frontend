import type { Id } from "@/lib/api/types";

/**
 * DRF relations may serialize as a nested object *or* a bare id depending on the
 * view (e.g. `bid.vendor` might be `{ id, company_name }` or just `3`). These
 * helpers let components read either shape without guarding at every use site.
 */

/** True when the value is a nested object rather than a scalar id. */
export function isObjectRef<T>(value: T | Id | null | undefined): value is T {
  return typeof value === "object" && value !== null;
}

/** The nested object if present, else undefined. */
export function asObjectRef<T>(value: T | Id | null | undefined): T | undefined {
  return isObjectRef(value) ? value : undefined;
}

/** The id whether the value is nested (`.id`) or already an id. */
export function refId(
  value: { id: Id } | Id | null | undefined,
): Id | undefined {
  if (value === null || value === undefined) return undefined;
  if (isObjectRef(value)) return value.id;
  return value;
}
