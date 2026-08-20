<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Jawak Frontend — Engineering Guide

Frontend for **Jawak**, a bid-based marketplace for local clothing manufacturing
("Upwork for garment production"). It talks to a Django REST API. Read
[Overview.md](Overview.md) for the domain model and the full endpoint list;
this file is *how we build*.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui
· TanStack Query · Zustand · nuqs · React Hook Form + Zod**.

> Before writing framework code, re-read the relevant guide under
> `node_modules/next/dist/docs/`. Next 16 renamed and changed things (see
> "Next 16 gotchas" below). Trust the bundled docs over memory.

## Three roles, three UIs

The API has three roles — `client`, `vendor`, `admin` — decided by
`GET /api/v1/user/me/ → role`. Each gets its own URL namespace, layout, and
component tree:

```
app/
  (auth)/login/              # /login — no URL segment (route group)
  client/…                   # /client/*  — customer dashboard
  vendor/…                   # /vendor/*  — vendor dashboard
  admin/…                    # /admin/*   — admin console
  api/                       # the BFF (see below) — never called by Django
  page.tsx                   # /  → public marketing landing page (CTAs → /login)
proxy.ts                     # route guard (was middleware.ts in Next ≤15)

components/
  ui/                        # shadcn primitives — do not hand-roll these
  shared/                    # cross-role: notification bell, chat, review, vendor card
  client/  vendor/  admin/   # per-role components, mirroring the route tree
lib/
  api/        # django server client + browser fetcher
  query/      # QueryClient + query-key factory + invalidation maps
  auth/       # cookie + session helpers (server only)
  stores/     # Zustand slices (client UI state only)
  validation/ # Zod schemas — double as API payload contracts
  hooks/      # shared React hooks (useSession, …)
  env.ts      # zod-validated server env (server only — never import from a client component)
```

**Component placement rule:** a page/tab's component lives under its role folder
mirroring the route — e.g. the vendor bids tab → `components/vendor/bids/*`. Only
promote to `components/shared/` when a second role actually needs it. Don't
pre-share.

## Ground rules

1. **Global theme, zero hardcoded colors.** All color comes from the CSS tokens
   in `app/globals.css` via Tailwind (`bg-background`, `text-muted-foreground`,
   `border-border`, `bg-primary`…). A hex, `rgb()`, or raw palette class
   (`zinc-500`, `text-black`, `bg-red-50`) in a component is a bug. Dark mode is
   the `.dark` class driven by `next-themes`; never gate styling on it manually.
2. **shadcn/ui first.** Buttons, inputs, forms, cards, tables, dialogs, tabs,
   dropdowns, toasts — add via the shadcn CLI into `components/ui/` and compose.
   Don't rebuild a primitive that shadcn ships. Icons: `@hugeicons/react`.
3. **TypeScript, no `any`.** Model API shapes as types in `lib/api` / Zod schemas.
4. **Server owns the token; the client never sees it.** See auth below.

## State — five layers, one tool each

Put each kind of state in the right place. Most bugs come from server data
leaking into React state.

| Layer | Holds | Tool |
| :--- | :--- | :--- |
| Server state | requests, bids, orders, vendors, reviews, notifications, disputes, analytics | **TanStack Query** |
| Auth/session | current user + role | `useSession()` → `useQuery` on `me` (token is server-side only) |
| URL state | filters (`?status=`), `?request=<id>`, pagination, active tab, search | **nuqs** |
| Form state | every create/edit form | **React Hook Form + Zod** (`components/ui/form`) |
| Global UI state | sidebar, command palette, modal orchestration | **Zustand** (`lib/stores`) |

TanStack Query conventions:
- **All keys come from the factory** in `lib/query/keys.ts` — never inline an
  array literal as a key.
- URL state (nuqs) is the source of truth for filters and **feeds the query key**,
  so a shareable URL reproduces the view.
- `notifications` uses `refetchInterval` (polling — the API has no websockets).
- Mutations that cascade must invalidate every affected key. The big one:
  **accepting a bid** rejects the other bids *and* creates an order → invalidate
  `bids`, `requests`, and `orders` together. Map these in `lib/query`.
- Multipart endpoints (`requests/`, reference-images, portfolio,
  production-updates) send `FormData`, not JSON. RHF holds the `File`; build
  `FormData` at submit.

## Data flow — the BFF (Backend-for-Frontend)

The browser **never** calls Django directly and **never** holds the JWT. Instead:

```
Browser (TanStack Query, same-origin fetch to /api/v1/*)
   │  cookie sent automatically (httpOnly, JS can't read it)
   ▼
Next Route Handler  app/api/v1/[...path]/route.ts   ← the BFF forwarder
   │  reads httpOnly access cookie → adds  Authorization: Bearer <access>
   │  on 401 → refresh via refresh cookie → retry once → rotate cookie
   ▼
Django REST  ${DJANGO_API_URL}/api/v1/*
```

- **Tokens live in httpOnly cookies** (`jawak_access`, `jawak_refresh`), set only
  inside Route Handlers. Safe from XSS. A non-sensitive `jawak_role` cookie holds
  the role for optimistic routing.
- **Login:** the client gets a Google access token (Google Identity Services),
  POSTs it to `/api/auth/google`, which exchanges it at Django, sets the cookies,
  and returns the user. **Logout:** `/api/auth/logout` clears them.
- **Route protection** lives in `proxy.ts`. Public paths (`/` landing, `/login`)
  are open to everyone; a signed-in user hitting `/login` is bounced to their
  role home. Everything else: unauthenticated → `/login`; wrong-role prefix →
  their own home. This is an *optimistic* check only (Next docs are explicit
  proxy is not a security boundary). Real enforcement is Django's role/ownership
  checks behind the BFF.
- Browser code fetches via `lib/api/http.ts` (same-origin `/api/v1/...`). It never
  imports `lib/env.ts`, `lib/auth/*`, or anything under `app/api`.

## Next 16 gotchas (verified against the bundled docs)

- **`middleware.ts` → `proxy.ts`** (root level, exports `proxy`, `config.matcher`,
  Node.js runtime). Same behavior, new name.
- **`cookies()` is async** — `const store = await cookies()`. Read anywhere on the
  server; **set/delete only in Route Handlers or Server Functions.**
- Route Handler dynamic params are a Promise: `const { path } = await ctx.params`,
  typed via the global `RouteContext<'/api/v1/[...path]'>`.
- `LayoutProps<'/'>` / `PageProps` global types are generated on `next dev|build|typegen`.
- Route Handlers are **not cached** except `GET` with `dynamic = 'force-static'`.

## Conventions (decided)

### Naming
- **Files:** kebab-case — `app-header.tsx`, `use-session.ts`, `theme-toggle.tsx`.
- **Components:** PascalCase, one main component per file. Prefer *named*
  exports; Next route files (`page.tsx`, `layout.tsx`, `error.tsx`, `route.ts`)
  keep their required default export.
- **Hooks:** `use-*`, named export.
- **Query keys:** only from the `lib/query/keys.ts` factory — never inline an
  array literal.
- **Zod schemas:** live in `lib/validation/*` and *are* the payload contract;
  derive TS types with `z.infer` rather than declaring shapes twice.

### Error & loading
- Per route segment, colocate `loading.tsx` (Suspense fallback) and `error.tsx`
  (error boundary — a Client Component that takes `{ error, reset }`).
- Use `<Skeleton>` matching the content shape, not a bare spinner, when the
  layout is known.
- **Form validation** renders inline via `<FormMessage>` (from Zod) — never a
  toast.
- Surface the real failure: read `ApiError.detail` from the BFF, not a generic
  "Something went wrong".

### Toasts (sonner)
- Toasts are for **mutation outcomes only** — the result of a user action with a
  side effect (*"Bid submitted"*, *"Dispute resolved"*, or a failure).
- **Never** for validation (inline) or loading (skeletons).
- Success copy is short and specific; error copy uses the API `detail`.
- One `<Toaster>`, mounted in `components/providers/providers.tsx`.

## Commands

- `npm run dev` — dev server (rewrites this file's top block; commit it).
- `npm run build` / `npm run lint`.
- Env: copy `.env.example` → `.env.local`. `DJANGO_API_URL` (server) points at the
  Django host; `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (public) for Google Sign-In.
