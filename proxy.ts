import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_ACCESS,
  COOKIE_ROLE,
  LOGIN_PATH,
  ROLES,
  ROLE_HOME,
  type Role,
} from "@/lib/config";

/**
 * Route guard (formerly middleware.ts — renamed to proxy in Next 16).
 *
 * This is an *optimistic* check only: it reads the presence of the session
 * cookie and the non-secret role hint to redirect early and avoid a flash of
 * the wrong dashboard. It is NOT the security boundary — Django enforces real
 * role/ownership behind the BFF. Per the Next docs, never treat proxy as auth.
 */

/** Open to everyone — no session required. */
const PUBLIC_PATHS = new Set<string>(["/", LOGIN_PATH]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthed = Boolean(request.cookies.get(COOKIE_ACCESS)?.value);
  const roleValue = request.cookies.get(COOKIE_ROLE)?.value;
  const role = ROLES.includes(roleValue as Role)
    ? (roleValue as Role)
    : undefined;

  const home = role ? ROLE_HOME[role] : LOGIN_PATH;

  // Signed-in users skip the login page — straight to their dashboard.
  if (pathname === LOGIN_PATH && isAuthed) return redirect(request, home);

  // Public pages (marketing landing + login) are open to everyone.
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Everything else is protected.
  if (!isAuthed) {
    const url = new URL(LOGIN_PATH, request.url);
    url.searchParams.set("next", pathname);
    return redirect(request, url);
  }

  // Keep each role inside its own namespace.
  for (const r of ROLES) {
    if (pathname === `/${r}` || pathname.startsWith(`/${r}/`)) {
      return r === role ? NextResponse.next() : redirect(request, home);
    }
  }

  return NextResponse.next();
}

function redirect(request: NextRequest, to: string | URL) {
  return NextResponse.redirect(new URL(to, request.url));
}

export const config = {
  // Run on pages only; skip the BFF, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml)$).*)",
  ],
};
