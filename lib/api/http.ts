import { API_BASE } from "@/lib/config";

/**
 * Browser fetcher. Talks only to the same-origin BFF (`/api/v1/*`) — the
 * httpOnly cookie rides along automatically, so there is no token handling here.
 * Do NOT import anything server-only (env, cookies, django client) into this file.
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = `${API_BASE}/${path.replace(/^\/+/, "")}`;
  if (!params) return url;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${url}?${qs}` : url;
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

async function parse(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  method: string,
  path: string,
  opts: { params?: QueryParams; body?: unknown } = {},
): Promise<T> {
  const isForm = opts.body instanceof FormData;
  const res = await fetch(buildUrl(path, opts.params), {
    method,
    // JSON by default; let the browser set the multipart boundary for FormData.
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body:
      opts.body === undefined
        ? undefined
        : isForm
          ? (opts.body as FormData)
          : JSON.stringify(opts.body),
  });

  const data = await parse(res);
  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, detail, data);
  }
  return data as T;
}

/** Thin verbs over the BFF. `body` may be a plain object (JSON) or FormData. */
export const api = {
  get: <T>(path: string, params?: QueryParams) =>
    request<T>("GET", path, { params }),
  post: <T>(path: string, body?: unknown, params?: QueryParams) =>
    request<T>("POST", path, { body, params }),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
