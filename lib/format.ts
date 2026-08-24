import type { Money } from "@/lib/api/types";

/**
 * Shared display formatters. Everything tolerates null/undefined and bad input
 * so a missing field never throws in render — it just shows a dash.
 */

const DASH = "—";

/**
 * Parse an API date/datetime. A date-only value (`YYYY-MM-DD`) is parsed as a
 * *local* calendar date — `new Date("2026-08-22")` would otherwise be read as
 * UTC midnight and display as the previous day west of UTC.
 */
function parseApiDate(value: string): Date {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  return new Date(value);
}

export function formatDate(value?: string | null): string {
  if (!value) return DASH;
  const d = parseApiDate(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return DASH;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Compact relative time ("3h ago", "just now", "in 2d"). */
export function formatRelative(value?: string | null): string {
  if (!value) return DASH;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return DASH;
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;

  if (abs < min) return "just now";
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (abs < hour) return rtf.format(Math.round(diffMs / min), "minute");
  if (abs < day) return rtf.format(Math.round(diffMs / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diffMs / day), "day");
  return formatDate(value);
}

export function formatMoney(value?: Money | null): string {
  if (value === null || value === undefined || value === "") return DASH;
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return DASH;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatQuantity(value?: number | null): string {
  if (value === null || value === undefined) return DASH;
  return `${new Intl.NumberFormat().format(value)} pcs`;
}

/** Render a value that may be a string[] (e.g. a JSONField) or a plain string. */
export function formatList(value?: string[] | string | null): string {
  if (Array.isArray(value)) return value.length ? value.join(", ") : DASH;
  return value && value.trim() ? value : DASH;
}

/** Initials for an avatar fallback, from a name or email. */
export function initials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return "?";
  const base = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0]
    : nameOrEmail;
  const parts = base.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
