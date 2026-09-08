/**
 * Resolve an image URL that came from the API to something the browser can load.
 *
 * Django serves uploaded media from its own origin and returns **relative**
 * paths (e.g. `/media/design_requests/foo.png`). Left as-is, `next/image` and
 * `<img>` resolve those against the frontend origin (`localhost:3000/media/…`),
 * which 404s. We prefix them with the backend origin from
 * `NEXT_PUBLIC_BACKEND_URL`. Absolute URLs (S3/CDN), `data:`, and `blob:`
 * previews are already loadable and pass through untouched.
 *
 * Keep the backend host in `next.config.ts` `images.remotePatterns` in sync, or
 * the image optimizer will reject the resolved URL.
 */
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(
  /\/$/,
  "",
);

export function mediaUrl(src?: string | null): string {
  if (!src) return "";
  // Already loadable: absolute http(s), protocol-relative, or an inline/preview URL.
  if (/^(https?:)?\/\//i.test(src) || /^(data|blob):/i.test(src)) return src;
  // No backend origin configured — return the relative path as a last resort.
  if (!BACKEND_ORIGIN) return src;
  return `${BACKEND_ORIGIN}/${src.replace(/^\//, "")}`;
}
