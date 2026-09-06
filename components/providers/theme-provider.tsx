"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Minimal theme provider (replaces `next-themes`). We manage the `.dark` class
 * and `color-scheme` ourselves for two reasons:
 *   1. `next-themes` renders an inline anti-flash `<script>` on every client
 *      render, which React 19 flags with a console error on each pass.
 *   2. We only need three modes and a class toggle.
 *
 * The preference (localStorage) and the OS setting (matchMedia) are external
 * stores, so we read them with `useSyncExternalStore` — that keeps the server
 * and first client render in agreement (no hydration mismatch) and avoids
 * setState-in-effect. The pre-hydration flash is handled by `themeInitScript`,
 * rendered once in the server root layout's <head>.
 */

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "jawak_theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

// --- External store: the stored theme preference -------------------------------

const themeListeners = new Set<() => void>();

// In-memory fallback for when localStorage is unavailable (private mode, blocked
// storage). Keeps the toggle working for the current session even if the choice
// can't be persisted.
let volatileTheme: Theme | null = null;

function readStoredTheme(): Theme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {
    // localStorage can throw (private mode, blocked cookies) — fall back below.
  }
  return volatileTheme ?? "system";
}

function subscribeTheme(callback: () => void): () => void {
  themeListeners.add(callback);
  // Cross-tab changes arrive via the storage event; same-tab changes are pushed
  // by `setTheme` calling every listener directly.
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function writeTheme(theme: Theme) {
  // Record in memory first so the choice takes effect even if persistence fails.
  volatileTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked — the choice holds for this session but won't persist.
  }
  for (const listener of themeListeners) listener();
}

// --- External store: the OS color-scheme preference ---------------------------

function subscribeSystem(callback: () => void): () => void {
  const mq = window.matchMedia(DARK_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSystemIsDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches;
}

// --- Applying the resolved theme to the document ------------------------------

/** Apply the resolved theme to <html>, briefly suppressing color transitions. */
function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode("*,*::before,*::after{transition:none !important}"),
  );
  document.head.appendChild(style);

  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;

  // Force a reflow so the no-transition rule lands before the swap, then drop it.
  document.body.getBoundingClientRect();
  requestAnimationFrame(() => style.remove());
}

// --- Context ------------------------------------------------------------------

type ThemeContextValue = {
  /** The user's choice: light, dark, or follow the OS. */
  theme: Theme;
  /** What `theme` currently resolves to after applying the OS preference. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    () => "system" as Theme,
  );
  const systemIsDark = useSyncExternalStore(
    subscribeSystem,
    getSystemIsDark,
    () => false,
  );

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  // Mirror the resolved theme onto <html>. DOM-only side effect (no setState),
  // so it stays in sync with toggles and OS changes after the initial paint.
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => writeTheme(next), []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within <ThemeProvider>");
  }
  return ctx;
}

/**
 * Inline script that sets the theme class before first paint, so there's no
 * flash of the wrong theme. Rendered once, server-side, in the root layout's
 * <head>. It runs as static HTML (never re-rendered by a client component), so
 * React never warns about it.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('${DARK_QUERY}').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;
