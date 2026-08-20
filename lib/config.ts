/**
 * Shared, non-secret constants. Safe to import from both server and client.
 * (Secrets live in lib/env.ts, which is server-only.)
 */

/** Same-origin base the browser talks to. The BFF lives here. */
export const API_BASE = "/api/v1";

/** httpOnly cookies holding the JWTs. Only Route Handlers read/write these. */
export const COOKIE_ACCESS = "jawak_access";
export const COOKIE_REFRESH = "jawak_refresh";
/** Non-sensitive role hint so proxy.ts can route optimistically without Django. */
export const COOKIE_ROLE = "jawak_role";

/** Access token lifetime is 60 min (see Overview.md); refresh a little early. */
export const ACCESS_MAX_AGE = 60 * 60;
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 14;

export const ROLES = ["client", "vendor", "admin"] as const;
export type Role = (typeof ROLES)[number];

/** Where each role lands after login / from `/`. */
export const ROLE_HOME: Record<Role, string> = {
  client: "/client",
  vendor: "/vendor",
  admin: "/admin",
};

export const LOGIN_PATH = "/login";
