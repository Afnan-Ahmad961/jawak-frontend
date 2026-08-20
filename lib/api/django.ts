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

/** Attempt to mint a new access token from a refresh token. */
export async function refreshAccess(
  refresh: string,
): Promise<string | null> {
  const res = await fetch(djangoUrl("user/auth/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access?: string };
  return data.access ?? null;
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
  const res = await fetch(djangoUrl("user/auth/google/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: googleAccessToken }),
    cache: "no-store",
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
