import "server-only";
import { z } from "zod";

/**
 * Server-only environment. Importing this from a Client Component is a build
 * error (thanks to `server-only`) — that's intentional; it holds the Django
 * host the browser must never address directly.
 */
const schema = z.object({
  DJANGO_API_URL: z
    .string()
    .url()
    .default("http://localhost:8000")
    // normalize away any trailing slash so we can join paths predictably
    .transform((v) => v.replace(/\/+$/, "")),
});

const parsed = schema.safeParse({
  DJANGO_API_URL: process.env.DJANGO_API_URL,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid server environment:\n${issues}`);
}

export const env = parsed.data;

/** Full Django API base, e.g. http://localhost:8000/api/v1 */
export const DJANGO_API = `${env.DJANGO_API_URL}/api/v1`;
