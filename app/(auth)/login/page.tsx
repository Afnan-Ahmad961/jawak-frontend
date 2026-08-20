"use client";

import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GoogleIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLE_HOME, ROLES, type Role } from "@/lib/config";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: () => void };
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

export default function LoginPage() {
  const [gsiReady, setGsiReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Identity Services once.
  useEffect(() => {
    let cancelled = false;
    const markReady = () => {
      if (!cancelled) setGsiReady(true);
    };
    if (window.google?.accounts?.oauth2) {
      // Defer to avoid a synchronous setState inside the effect body.
      queueMicrotask(markReady);
      return () => {
        cancelled = true;
      };
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    const onLoad = markReady;
    if (existing) {
      existing.addEventListener("load", onLoad);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", onLoad);
      };
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => {
      cancelled = true;
      script.removeEventListener("load", onLoad);
    };
  }, []);

  // Hand the Google token to our BFF, which sets the httpOnly cookies.
  const exchange = useCallback(async (googleAccessToken: string) => {
    setError(null);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: googleAccessToken }),
      });
      const data = (await res.json().catch(() => null)) as {
        user?: { role?: string };
        detail?: string;
      } | null;
      if (!res.ok) {
        throw new Error(data?.detail ?? "Sign-in failed");
      }
      const role = (data?.user?.role ?? "client") as Role;
      const home = ROLES.includes(role) ? ROLE_HOME[role] : ROLE_HOME.client;
      // Full navigation so proxy.ts + the new cookies take effect.
      window.location.assign(home);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "Sign-in failed");
    }
  }, []);

  const signIn = useCallback(() => {
    setError(null);
    if (!GOOGLE_CLIENT_ID) {
      setError("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Add it to .env.local.");
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      setError("Google is still loading — try again in a moment.");
      return;
    }
    setLoading(true);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          setLoading(false);
          setError(response.error ?? "Google did not return a token.");
          return;
        }
        void exchange(response.access_token);
      },
    });
    client.requestAccessToken();
  }, [exchange]);

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sign in to Jawak</CardTitle>
          <CardDescription>
            A bid-based marketplace for local clothing manufacturing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            size="lg"
            className="w-full"
            disabled={loading || !gsiReady}
            onClick={signIn}
          >
            <HugeiconsIcon icon={GoogleIcon} />
            {loading
              ? "Signing in…"
              : gsiReady
                ? "Continue with Google"
                : "Loading…"}
          </Button>

          {error && (
            <p className="text-destructive flex items-center gap-2 text-xs">
              <HugeiconsIcon icon={Alert02Icon} className="size-4 shrink-0" />
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
