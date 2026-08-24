import type { NextConfig } from "next";

type RemotePatterns = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>;

/** The project's S3 bucket that stores uploaded media (design/reference/etc). */
const S3_BUCKET = "jawak-bucket";

/**
 * Uploaded media lives in S3. Allow both S3 URL styles for this bucket only:
 *   - path/legacy: `jawak-bucket.s3.amazonaws.com`
 *   - regional:    `jawak-bucket.s3.<region>.amazonaws.com` (`*` = one segment)
 * Scoped to the bucket rather than a blanket `*.amazonaws.com` so the image
 * optimizer can't be pointed at arbitrary S3 hosts.
 */
const S3_PATTERNS: RemotePatterns = [
  { protocol: "https", hostname: `${S3_BUCKET}.s3.amazonaws.com` },
  { protocol: "https", hostname: `${S3_BUCKET}.s3.*.amazonaws.com` },
];

/**
 * Allow the image optimizer to fetch only from the media hosts we actually use,
 * never a blanket wildcard (that turns `/_next/image` into an open outbound
 * fetch proxy). Sources: the S3 bucket above plus hosts derived from env:
 *   - DJANGO_API_URL       — Django serves local media in dev.
 *   - NEXT_PUBLIC_MEDIA_URL — CDN/custom media origin in prod (optional).
 */
function mediaRemotePatterns(): RemotePatterns {
  const patterns: RemotePatterns = [...S3_PATTERNS];

  for (const raw of [
    process.env.DJANGO_API_URL,
    process.env.NEXT_PUBLIC_MEDIA_URL,
  ]) {
    if (!raw) continue;
    try {
      const url = new URL(raw);
      const protocol = url.protocol.replace(":", "");
      if (protocol !== "http" && protocol !== "https") continue;
      patterns.push({
        protocol,
        hostname: url.hostname,
        // Set port explicitly: an empty string pins the default port, whereas
        // omitting `port` lets Next match any port (a wildcard we don't want).
        port: url.port,
      });
    } catch {
      // Ignore malformed values; a missing host just means those images
      // won't be optimized (they'd be rejected), which is the safe default.
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  // Our API calls hit same-origin `/api/v1/*` with a trailing slash (Django's
  // APPEND_SLASH). Don't let Next 308-redirect those to the slash-less variant
  // before they reach the BFF — the BFF is the single authority for the slash
  // it forwards to Django.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: mediaRemotePatterns(),
  },
};

export default nextConfig;
