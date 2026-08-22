import type { NextConfig } from "next";

/**
 * Allow the image optimizer to fetch only from the media hosts we actually use,
 * never a wildcard (a wildcard turns `/_next/image` into an open outbound fetch
 * proxy). Hosts are derived from env:
 *   - DJANGO_API_URL      — Django serves local media in dev.
 *   - NEXT_PUBLIC_MEDIA_URL — S3/CDN origin for uploaded media in prod (optional).
 */
function mediaRemotePatterns(): NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
> {
  const patterns: NonNullable<
    NonNullable<NextConfig["images"]>["remotePatterns"]
  > = [];

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
  images: {
    remotePatterns: mediaRemotePatterns(),
  },
};

export default nextConfig;
