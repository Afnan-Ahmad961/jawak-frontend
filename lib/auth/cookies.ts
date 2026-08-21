import "server-only";
import { cookies } from "next/headers";
import {
  ACCESS_MAX_AGE,
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_ROLE,
  REFRESH_MAX_AGE,
  ROLES,
  type Role,
} from "@/lib/config";

/**
 * Cookie plumbing for the session. `cookies()` is async in Next 16 and can only
 * be *written* inside Route Handlers / Server Functions — so setSession/clearSession
 * must be called from there, never during a page render.
 */

const baseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export type Session = {
  access: string;
  refresh: string;
  role: Role;
};

export async function readAccess(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_ACCESS)?.value;
}

export async function readRefresh(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_REFRESH)?.value;
}

export async function readRole(): Promise<Role | undefined> {
  const value = (await cookies()).get(COOKIE_ROLE)?.value;
  return ROLES.includes(value as Role) ? (value as Role) : undefined;
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_ACCESS, session.access, {
    ...baseOptions,
    maxAge: ACCESS_MAX_AGE,
  });
  store.set(COOKIE_REFRESH, session.refresh, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE,
  });
  // role is not secret: readable by proxy.ts for optimistic routing.
  store.set(COOKIE_ROLE, session.role, {
    ...baseOptions,
    httpOnly: false,
    maxAge: REFRESH_MAX_AGE,
  });
}

/** Rotate just the access token after a successful refresh. */
export async function setAccess(access: string): Promise<void> {
  (await cookies()).set(COOKIE_ACCESS, access, {
    ...baseOptions,
    maxAge: ACCESS_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  for (const name of [COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_ROLE]) {
    store.set(name, "", { ...baseOptions, httpOnly: false, maxAge: 0 });
  }
}
