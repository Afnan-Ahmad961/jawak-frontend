import { NextResponse } from "next/server";
import { djangoUrl, fetchDjangoWithTimeout } from "@/lib/api/django";
import { clearSession, readAccess } from "@/lib/auth/cookies";

export const dynamic = "force-dynamic";

/**
 * Logout. Best-effort tells Django to invalidate, then always clears our
 * cookies so the client ends up signed out regardless of the upstream result.
 */
export async function POST() {
  const access = await readAccess();
  if (access) {
    await fetchDjangoWithTimeout(djangoUrl("user/auth/logout/"), {
      method: "POST",
      headers: { Authorization: `Bearer ${access}` },
    }).catch(() => {
      /* ignore — we clear locally regardless */
    });
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
