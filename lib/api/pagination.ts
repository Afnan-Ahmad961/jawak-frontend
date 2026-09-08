import type { Paginated } from "@/lib/api/types";

/**
 * Normalize a list response. DRF endpoints may return a bare array or a
 * paginated envelope (`{ count, next, previous, results }`) depending on
 * whether pagination is enabled for that view. List hooks call this so they
 * don't have to care which one they got back.
 */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (
    data &&
    typeof data === "object" &&
    "results" in data &&
    Array.isArray((data as Paginated<T>).results)
  ) {
    return (data as Paginated<T>).results;
  }
  return [];
}

/** Total count from a list response, falling back to the array length. */
export function listCount(data: unknown): number {
  if (
    data &&
    typeof data === "object" &&
    "count" in data &&
    typeof (data as Paginated<unknown>).count === "number"
  ) {
    return (data as Paginated<unknown>).count;
  }
  return unwrapList(data).length;
}
