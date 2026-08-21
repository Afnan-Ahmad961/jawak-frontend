import "server-only";
import { DJANGO_API } from "@/lib/env";

/**
 * Low-level server-to-Django calls. Nothing here touches cookies — callers
 * (Route Handlers) own the token lifecycle. Keeping this cookie-free makes it
 * safe to use during login, before a session exists.
 */

/** Build an absolute Django URL from a path (with or without leading slash). */
export function djangoUrl(path: string): string {
  return `${DJANGO_API}/${path.replace(/^\/+/, "")}`;
}

/** Timeout for Django calls (30 seconds). */
const DJANGO_TIMEOUT_MS = 30_000;

/**
 * Shared fetch helper for calling Django with timeout and proper error handling.
 * Throws DjangoError on failures, distinguishing transport (502) from auth (401).
 */
export async function fetchDjangoWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DJANGO_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    // Network/timeout errors → transport failure (502).
    if (err instanceof Error && err.name === "AbortError") {
      throw new DjangoError(502, "Django request timeout");
    }
    throw new DjangoError(502, "Django unreachable");
  }
}

/** Attempt to mint a new access token from a refresh token. */
export async function refreshAccess(
  refresh: string,
): Promise<string | null> {
  try {
    const res = await fetchDjangoWithTimeout(djangoUrl("user/auth/token/refresh/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access?: string };
    return data.access ?? null;
  } catch {
    // Transport failure or invalid refresh → null (caller will clear session).
    return null;
  }
}

/** Exchange a Google access token for Jawak JWTs + user. */
export type GoogleExchange = {
  access: string;
  refresh: string;
  user: { id: number | string; email: string; role: string; [k: string]: unknown };
};

export async function exchangeGoogleToken(
  googleAccessToken: string,
): Promise<GoogleExchange> {
  const res = await fetchDjangoWithTimeout(djangoUrl("user/auth/google/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: googleAccessToken }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new DjangoError(res.status, detail);
  }
  return (await res.json()) as GoogleExchange;
}

export class DjangoError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(`Django responded ${status}`);
    this.name = "DjangoError";
  }
}
