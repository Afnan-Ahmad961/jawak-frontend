# Jawak Frontend — Dev Log

A running record of everything built on the frontend: what was added, why, and
how it fits the conventions in [AGENTS.md](AGENTS.md). Newest entries at the top.

---

## 2026-08-24 — Vendor & admin flows

Completed the two remaining role dashboards, reusing the client foundation
(types, hooks, shared components) built earlier.

### Shared additions

- **Types** (`lib/api/types.ts`): `CreateBidRequest`, `VendorProfilePayload`,
  `DisputeResolution`, and the `AnalyticsOverview` shape (+ breakdown/top-vendor
  helpers). Broadened `Bid.design_request` to `DesignRequest | Id` so the
  vendor's bid list can show request titles.
- **Hooks**: `useMyVendorProfile` (null on 404 → onboarding), `useCreateVendorProfile`,
  `useUpdateVendorProfile`, `useAddPortfolioItem`, `useDeletePortfolioItem`
  (use-vendors); `usePlaceBid` (use-bids); `useAddProductionUpdate` (use-orders);
  `useResolveDispute` (use-disputes); `useAnalyticsOverview` (new use-analytics).
- **Invalidation**: `vendorProfileMutated` (also refreshes `me` — first profile
  promotes the account to vendor), `portfolioMutated`, `bidPlaced`.
- **Validation**: `bid`, `vendor-profile`, `production-update`, `dispute-resolution`.
- **Messaging promoted to shared**: `MessagesView` now takes a `perspective`
  (`client` | `vendor`) so both roles share one two-pane chat; the counterparty
  (vendor for a client, client for a vendor) resolves via `lib/conversation.ts`.
  `ConversationList` is perspective-aware. Removed the client-only copy.

### Vendor routes (`app/vendor/*`, colocated loading + error)

- `/vendor` — dashboard (profile prompt if none; bid/order stat tiles + recent activity).
- `/vendor/profile` — create/edit profile (creating promotes to vendor) + portfolio manager.
- `/vendor/jobs` · `/[id]` — open job board (flags already-bid jobs) + detail with a bid form / your-bid + withdraw, message client.
- `/vendor/bids` — all own bids with withdraw.
- `/vendor/orders` · `/[id]` — assigned orders + production timeline, post production update (multipart), review client.
- `/vendor/messages` — shared chat (vendor perspective).

### Admin routes (`app/admin/*`, colocated loading + error)

- `/admin` — analytics overview: totals, avg bid / bids-per-request / dispute
  rate, requests-by-apparel-type and orders-by-status bars, top vendors.
  Breakdowns normalize both map and list serializations.
- `/admin/disputes` · `/[id]` — all disputes with status filter + resolve/reject
  dialog (resolution required); detail shows the complaint and resolution.

### Notes

- Removed the now-unused `dashboard-placeholder`.
- All colors via tokens; keys from the factory; nuqs feeds keys; multipart at
  submit; inline validation; toasts for outcomes; no `any`.

### Review

Ran CodeRabbit across three passes; fixed all findings:
- API payload types centralized in `lib/api` (`CreatePortfolioItemRequest`,
  `CreateProductionUpdateRequest`) instead of inline hook shapes.
- Production-update dialog offers only forward stages and re-seeds the default
  to the next stage on open (no more backend-rejected non-forward updates).
- Vendor job detail waits for the bids query (loading + error/retry) before
  showing the bid form, so an existing bidder can't submit a duplicate.
- Vendor profile capacity: blank input stays `undefined` (no coerce-to-0).
- Portfolio remove control is keyboard-focus visible.
- `dispute_rate` documented as a fraction (0–1) and rendered as a percent
  (removed the ambiguous fraction-or-percent heuristic).

Lint, typecheck, and `next build` all pass. (The final `dispute_rate` fix
landed after CodeRabbit's review quota for the window was reached; it's a
self-contained formatter change verified by the local checks.)

---

## 2026-08-23 — Fix: align frontend to the real DB schema (POST requests/ 400)

`POST requests/` returned `400 {"sizes":["Value must be valid JSON."]}` — `sizes`
is a Django **JSONField**, but we sent a plain string. Got the authoritative
schema and added it to [Overview.md](Overview.md) §5, then aligned every
field-name mismatch (types + payloads + display):

- `design_request.sizes` — send a JSON array (`JSON.stringify(["S","M"])`) built
  from the comma-separated input; render arrays via `formatList`.
- `design_request.material` — new field added to the type, Zod schema, form, and
  detail view.
- `design_reference_image.label` — was `caption`.
- `message.body` — was `content` (both the send payload and rendering; this
  would have 400'd every chat message).
- `notification.is_read` / `notification_type` — were `read` / `type` (the bell's
  unread badge/dot depended on the wrong key).
- `vendor_profile.avg_rating` — was `rating` (vendor stars never rendered).
- `order.final_price` + `order.deadline` — order price was read from the
  non-existent `proposed_price`; delivery window now uses the bid's
  `delivery_days` and shows the order `deadline`.
- `user.username` — added; used as a display fallback.

## 2026-08-23 — Fix: preserve Django's trailing slash through the BFF

All API calls were failing because Django's `APPEND_SLASH` needs the trailing
slash to reach it, but Next's catch-all drops it (`/api/v1/requests/` →
`path ["requests"]`, `join("/")` → `requests`). Django then 302'd GETs and 500'd
POSTs. Fixes:

- **`app/api/v1/[...path]/route.ts`** re-adds the trailing slash to the forwarded
  path before the query string, so Django always gets `…/requests/`.
- **`next.config.ts`** sets `skipTrailingSlashRedirect: true` so Next doesn't
  308-redirect the incoming slashed URL before it reaches the BFF (avoids an
  extra hop / POST-body fragility). The BFF is the single authority for the
  slash. (Hook call paths already ended with `/`.)

## 2026-08-22 — Complete client (customer) flow

Goal: implement the entire customer journey end-to-end on the frontend against
the Django API described in [Overview.md](Overview.md), wired through the BFF.
Vendor and admin dashboards remain scaffolds; this pass is client-only plus the
shared components the client needs (notification bell, chat, reviews, vendor
cards, status badges).

### Foundation extensions

- **`lib/api/types.ts`** — added the full domain model mirrored from Django:
  `Vendor`, `PortfolioItem`, `DesignRequest`, `ReferenceImage`, `Bid`,
  `Order`, `ProductionUpdate`, `Review`, `Dispute`, `Conversation`, `Message`,
  `Notification`, plus a generic `Paginated<T>` envelope and vendor/user summary
  shapes. Money fields are typed `string | number` (DRF `DecimalField` serializes
  as a string) and formatted defensively.
- **`lib/api/pagination.ts`** — `unwrapList<T>()` tolerates both a bare array and
  DRF's `{ count, next, previous, results }` envelope so list hooks don't care
  which the endpoint returns.
- **`lib/format.ts`** — shared formatters: `formatDate`, `formatDateTime`,
  `formatRelative`, `formatMoney`, `formatQuantity`, and `initials`.
- **`lib/labels.ts`** — human labels + badge variants for every status union
  (request / bid / order / production stage / dispute) and apparel types. Keeps
  status → color mapping in one place (no hardcoded colors in components).
- **`lib/query/keys.ts`** — added `conversations.detail`, `orders` review lookup,
  and `notifications.unreadCount`.
- **`lib/query/invalidation.ts`** — added `requestMutated`, `bidWithdrawn`,
  `reviewCreated`, `disputeCreated`, `messageSent`, and `notificationsRead`
  cascades.

### Validation schemas (`lib/validation/`)

- `request.ts` — create/edit design request (+ `APPAREL_TYPES`, size options).
- `review.ts` — rating (1–5) + comment.
- `dispute.ts` — reason + description.
- `message.ts` — chat message body.

### Data hooks (`lib/hooks/`)

Query/mutation hooks, keys sourced from the factory, cascades from
`lib/query/invalidation.ts`:

- `use-requests.ts` — list/detail/create/update/delete + reference images.
- `use-bids.ts` — list by request, accept/reject (cascade), withdraw.
- `use-vendors.ts` — list/detail/own-profile.
- `use-orders.ts` — list/detail, confirm delivery, production updates.
- `use-reviews.ts` — list by order/vendor, create.
- `use-disputes.ts` — list/detail/create.
- `use-conversations.ts` — list, messages, start conversation, send message.
- `use-notifications.ts` — polling list + unread count, mark read / read-all.

### Shared components (`components/shared/`)

- `status-badge.tsx` — renders any status union with the right label + variant.
- `notification-bell.tsx` — polls unread, dropdown list, mark-read / read-all.
- `star-rating.tsx` — read + input star display.
- `vendor-card.tsx`, `vendor-summary.tsx` — vendor identity across screens.
- `review-list.tsx`, `review-form-dialog.tsx` — two-way reviews.
- `chat-panel.tsx`, `conversation-list.tsx` — client ↔ vendor negotiation.
- `image-gallery.tsx`, `empty-state.tsx`, `page-header.tsx`, `data-error.tsx`.

### Client routes (`app/client/…`) + components (`components/client/…`)

- `/client` — dashboard: request/order/bid stat tiles + recent activity.
- `/client/requests` — list with `?status=` filter (nuqs → query key), new-request CTA.
- `/client/requests/new` — multipart create form with design image + reference images.
- `/client/requests/[id]` — detail: specs, gallery, bid comparison table, accept/reject,
  message vendor, edit/delete.
- `/client/requests/[id]/edit` — edit form.
- `/client/orders` — orders list with `?status=` filter.
- `/client/orders/[id]` — production timeline, confirm delivery, review, raise dispute.
- `/client/vendors` — browse vendors (search via nuqs).
- `/client/vendors/[id]` — vendor profile: rating, reviews, portfolio.
- `/client/messages` — conversations + chat.
- Each segment has colocated `loading.tsx` (skeletons) and `error.tsx`.

### Conventions honored

- All colors via tokens; status colors centralized in `lib/labels.ts`.
- Every query key from `lib/query/keys.ts`; URL filters (nuqs) feed the keys.
- Toasts only for mutation outcomes; validation inline via `<FormMessage>`.
- Multipart `FormData` built at submit for image endpoints.
- No `any`; API shapes typed; `ApiError.detail` surfaced on failures.

### Review

- Ran CodeRabbit (`coderabbit review`) iteratively on the full changeset. First
  pass: 20 findings (1 critical, 11 major, 8 minor) — all fixed. Follow-up
  passes surfaced and fixed: image `remotePatterns` default-port pinning,
  dashboard stat tiles rendering a real `0` on query failure, duplicate-name
  React keys in the reference-image picker, and API request-body types moved to
  `lib/api` (`CreateReviewRequest`, `CreateDisputeRequest`, `BidStatusUpdate`,
  `StartConversationRequest`, `SendMessageRequest`). A final "duplicate type
  declaration" finding was a verified false positive (each type is declared
  once; `tsc --noEmit` is clean). Lint, typecheck, and `next build` all pass.

## 2026-08-22 — CodeRabbit fixes

Addressed every finding from the review of the client flow:

- **Critical:** reference-image upload in create mode targeted an empty id —
  `useAddReferenceImages` now takes the request id per mutation call, so the
  create flow uploads to the newly-created request.
- Bid comparison disables accept/reject on *all* rows while any bid mutation is
  in flight (prevents a second award racing the first).
- Messages: mobile layout is driven by the resolved conversation, not the raw
  `?c=` value, so a stale/invalid id no longer yields a dead-end blank pane.
- Chat composer guards against duplicate sends (Enter key while pending).
- Request form revokes design-preview blob URLs; vendor search syncs with
  back/forward; dashboard cards show a retry on query failure.
- shadcn primitives corrected: `Separator`/`Tabs` orientation, `Progress`
  indicator width, `AlertDialogAction` now closes via the Close part.
- Formatters: date-only strings parsed as local calendar dates; money rejects
  non-finite values; apparel labels normalize casing/separators.
- `next.config` image `remotePatterns` restricted to the configured media hosts
  (https), not a wildcard.
- Image gallery renders an accessible fallback when a URL fails to load.
