import { NextResponse, type NextRequest } from "next/server";
import {
  DjangoError,
  djangoUrl,
  fetchDjangoWithTimeout,
  refreshAccess,
} from "@/lib/api/django";
import {
  clearSession,
  readAccess,
  readRefresh,
  setAccess,
} from "@/lib/auth/cookies";

/**
 * BFF forwarder. The browser calls same-origin `/api/v1/*`; we attach the
 * httpOnly Bearer token and proxy to Django. On a 401 we transparently refresh
 * once and retry, rotating the access cookie. The token never reaches the client.
 *
 * See AGENTS.md → "Data flow — the BFF".
 */

// Never cache: every call is per-user and token-bearing.
export const dynamic = "force-dynamic";

// Headers we must not copy from the incoming request to Django. `authorization`
// is dropped so a client-sent value can't be combined with our BFF Bearer token.
const STRIP_REQUEST = new Set([
  "host",
  "cookie",
  "connection",
  "content-length",
  "authorization",
]);
// ...nor from Django's response back to the browser (fetch already decoded these).
const STRIP_RESPONSE = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
]);

type Ctx = RouteContext<"/api/v1/[...path]">;

async function forward(request: NextRequest, ctx: Ctx): Promise<Response> {
  const access = await readAccess();
  if (!access) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const { path } = await ctx.params;
  // Django enforces APPEND_SLASH, but Next's catch-all drops the trailing slash
  // (`/api/v1/requests/` → path `["requests"]`). Re-add it before the query
  // string so Django gets `/api/v1/requests/` and doesn't 302 (GET) or 500 (POST).
  const joined = path.join("/");
  const withSlash = joined.endsWith("/") ? joined : `${joined}/`;
  const target = djangoUrl(withSlash) + request.nextUrl.search;

  // Read the body once (if any) so we can safely retry after a refresh.
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const body = hasBody ? await request.arrayBuffer() : undefined;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIP_REQUEST.has(key.toLowerCase())) headers.set(key, value);
  });

  // Bounded call to Django; a transport/timeout failure throws DjangoError(502).
  const call = (token: string) =>
    fetchDjangoWithTimeout(target, {
      method: request.method,
      headers: new Headers([...headers, ["authorization", `Bearer ${token}`]]),
      body,
      redirect: "manual",
    });

  try {
    let upstream = await call(access);

    // Transparent refresh-and-retry on expiry.
    if (upstream.status === 401) {
      const refresh = await readRefresh();
      // refreshAccess returns null only for an invalid/expired refresh; a
      // transport failure throws DjangoError and is handled below as a 502.
      const fresh = refresh ? await refreshAccess(refresh) : null;
      if (fresh) {
        await setAccess(fresh);
        upstream = await call(fresh);
      } else {
        await clearSession();
        return NextResponse.json({ detail: "Session expired" }, { status: 401 });
      }
    }

    const respHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!STRIP_RESPONSE.has(key.toLowerCase())) respHeaders.set(key, value);
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: respHeaders,
    });
  } catch (err) {
    // Keep transport failures distinct from auth: surface a real 502.
    if (err instanceof DjangoError) {
      return NextResponse.json({ detail: err.detail }, { status: err.status });
    }
    throw err;
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
