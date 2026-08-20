"use client";

import { useCallback, useEffect, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const GSI_SRC = "https://accounts.google.com/gsi/client";

// Minimal typing for the Google Identity Services token client we use.
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

type JawakUser = {
  id?: number | string;
  email?: string;
  role?: string;
  [key: string]: unknown;
};

type AuthResult = {
  access: string;
  refresh?: string;
  user?: JawakUser;
};

export default function AuthPage() {
  const [gsiReady, setGsiReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuthResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Load the Google Identity Services script once.
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      setGsiReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    const onLoad = () => setGsiReady(true);
    if (existing) {
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }
    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onLoad);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", onLoad);
  }, []);

  const exchangeToken = useCallback(async (googleAccessToken: string) => {
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/user/auth/google/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: googleAccessToken }),
      });
      const text = await res.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
      if (!res.ok) {
        throw new Error(
          `Backend returned ${res.status}: ${
            typeof data === "string" ? data : JSON.stringify(data)
          }`,
        );
      }
      setResult(data as AuthResult);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to exchange token with backend",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(() => {
    setError(null);
    setResult(null);
    setCopied(false);

    if (!GOOGLE_CLIENT_ID) {
      setError(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Add it to .env.local and restart the dev server.",
      );
      return;
    }
    if (!window.google?.accounts?.oauth2) {
      setError("Google script not loaded yet. Try again in a moment.");
      return;
    }

    setLoading(true);
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error || !response.access_token) {
          setLoading(false);
          setError(response.error ?? "Google did not return an access token.");
          return;
        }
        void exchangeToken(response.access_token);
      },
    });
    client.requestAccessToken();
  }, [exchangeToken]);

  const copyToken = useCallback(async () => {
    if (!result?.access) return;
    try {
      await navigator.clipboard.writeText(result.access);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [result]);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <div className="w-full max-w-xl rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.12] dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Jawak — Google Sign-in
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Authenticate with Google to obtain a Jawak access token. Backend:{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-xs dark:bg-white/[.08]">
            {BACKEND_URL}
          </code>
        </p>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading || !gsiReady}
          className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          {loading
            ? "Signing in…"
            : gsiReady
              ? "Continue with Google"
              : "Loading Google…"}
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {result?.access && (
          <div className="mt-6 space-y-4">
            {result.user && (
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                Signed in as{" "}
                <span className="font-medium">
                  {result.user.email ?? "unknown"}
                </span>
                {result.user.role && (
                  <span className="ml-1 rounded-full bg-black/[.06] px-2 py-0.5 text-xs font-medium dark:bg-white/[.08]">
                    {result.user.role}
                  </span>
                )}
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Access token
                </label>
                <button
                  type="button"
                  onClick={copyToken}
                  className="rounded-md border border-black/[.1] px-3 py-1 text-xs font-medium transition-colors hover:bg-black/[.04] dark:border-white/[.15] dark:hover:bg-white/[.06]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <textarea
                readOnly
                value={result.access}
                onFocus={(e) => e.currentTarget.select()}
                className="h-32 w-full resize-none rounded-lg border border-black/[.1] bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:border-white/[.15] dark:bg-zinc-900 dark:text-zinc-200"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Send this as{" "}
                <code className="font-mono">Authorization: Bearer &lt;access&gt;</code>{" "}
                on API requests.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
