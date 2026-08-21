import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { DjangoError, exchangeGoogleToken } from "@/lib/api/django";
import { setSession } from "@/lib/auth/cookies";
import { ROLES, type Role } from "@/lib/config";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ access_token: z.string().min(1) });

/**
 * Login. Receives a Google access token from the browser, exchanges it at
 * Django, and stashes the resulting JWTs in httpOnly cookies. Returns only the
 * user (never the tokens) to the client.
 */
export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { detail: "Missing Google access_token" },
      { status: 400 },
    );
  }

  try {
    const { access, refresh, user } = await exchangeGoogleToken(
      parsed.data.access_token,
    );
    const role: Role = ROLES.includes(user.role as Role)
      ? (user.role as Role)
      : "client";

    await setSession({ access, refresh, role });
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof DjangoError) {
      return NextResponse.json(
        { detail: "Google sign-in failed" },
        { status: err.status === 0 ? 502 : err.status },
      );
    }
    return NextResponse.json({ detail: "Sign-in error" }, { status: 502 });
  }
}
