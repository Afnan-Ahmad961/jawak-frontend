# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** jawak-frontend
- **Date:** 2026-08-29
- **Prepared by:** TestSprite AI Team
- **Test Type:** Frontend (codebase scope)
- **Server Mode:** Development (`next dev`, port 3000) — run capped at 15 high-priority tests
- **Total Executed:** 15 / 45 generated
- **Result:** 3 Passed · 12 Blocked · 0 Functional Failures

---

## 2️⃣ Requirement Validation Summary

### Requirement: Authentication & Route Protection
Unauthenticated users must be redirected to `/login`; the public surface must remain reachable.

| Test | Name | Status |
|------|------|--------|
| TC001 | Unauthenticated visitors are redirected from protected client pages | ✅ Passed |
| TC005 | Unauthenticated visitors are redirected from a protected request list | ✅ Passed |
| TC006 | Unauthenticated visitors are redirected from a protected vendor jobs page | ✅ Passed |

- **Analysis / Findings:** The `proxy.ts` route guard behaves correctly. Every attempt to reach a protected `/client/*` or `/vendor/*` route while unauthenticated was redirected to `/login` (with a `?next=` return path), matching the documented optimistic-guard behavior. This is the only requirement fully verifiable without a real Google session, and it passed cleanly.

### Requirement: Client — Design Requests, Bids & Orders
Client can create/edit/delete requests, compare and award bids, track orders and confirm delivery.

| Test | Name | Status |
|------|------|--------|
| TC002 | Create a complete design request | 🚫 Blocked (auth) |
| TC003 | Accept a bid and award the job | 🚫 Blocked (auth) |
| TC004 | Confirm order delivery | 🚫 Blocked (auth) |
| TC008 | Browse and open own requests by status | 🚫 Blocked (auth) |
| TC010 | Track an order timeline | 🚫 Blocked (auth) |
| TC012 | Edit an existing request and save the changes | 🚫 Blocked (auth) |

- **Analysis / Findings:** None of these could execute their functional steps. Each test reached `/login`, which presents only a "Continue with Google" button, and the Google OAuth page rejected the automated browser with *"Couldn't sign you in — This browser or app may not be secure."* No app-level defect was observed; the blocker is environmental (OAuth cannot complete in a headless/automated browser).

### Requirement: Vendor — Profile, Portfolio, Bidding & Production
Vendor can create/update a profile, manage portfolio, bid on jobs, and post production updates.

| Test | Name | Status |
|------|------|--------|
| TC007 | Create vendor profile | 🚫 Blocked (auth) |
| TC009 | Submit a bid on an open job | 🚫 Blocked (auth) |
| TC013 | Browse vendor directory | 🚫 Blocked (auth) |
| TC014 | Post a production update on an assigned order | 🚫 Blocked (auth) |
| TC015 | Update vendor profile details | 🚫 Blocked (auth) |

- **Analysis / Findings:** Same root cause as the client flows — the Google SSO gate could not be passed, so no vendor-authenticated screen was reachable. TC013 additionally confirmed the guard works (`/vendors` → `/login?next=/vendors`) before hitting the OAuth wall.

### Requirement: Admin — Analytics & Disputes
Admin can view analytics and resolve/reject disputes.

| Test | Name | Status |
|------|------|--------|
| TC011 | Show admin analytics overview | 🚫 Blocked (auth) |

- **Analysis / Findings:** Blocked at Google OAuth. The admin console was never reached. (Dispute-resolution tests TC016, TC022, TC032, TC035, TC038 were generated but fell outside the 15-test dev-mode cap and did not run.)

---

## 3️⃣ Coverage & Matching Metrics

- **20.00%** of executed tests passed (3 / 15).
- **0** functional failures — every non-pass is an environmental block at the Google OAuth step, not an application defect.
- **100%** of the tests that do not require authentication passed.

| Requirement | Total Tests | ✅ Passed | 🚫 Blocked | ❌ Failed |
|-------------|-------------|-----------|-----------|-----------|
| Authentication & Route Protection | 3 | 3 | 0 | 0 |
| Client — Requests, Bids & Orders | 6 | 0 | 6 | 0 |
| Vendor — Profile, Bidding & Production | 5 | 0 | 5 | 0 |
| Admin — Analytics & Disputes | 1 | 0 | 1 | 0 |
| **Total** | **15** | **3** | **12** | **0** |

> Note: 45 tests were generated from the code summary; development-mode execution is capped at 15 high-priority tests to avoid overloading the single-threaded `next dev` server. Run a production build (`npm run build && npm run start`) to raise the cap to 30.

---

## 4️⃣ Key Gaps / Risks

1. **Automated end-to-end coverage is blocked by Google-only OAuth.** Sign-in is exclusively Google Identity Services, and Google refuses the automated test browser ("This browser or app may not be secure"). This makes 12 of 15 tests — and effectively every authenticated flow — untestable by an external UI runner. *This is a test-harness limitation, not a product bug.*
   - **Mitigations:** (a) add a test-only auth path or session-seeding endpoint gated behind an env flag (e.g. inject a signed session cookie) so the runner can bypass Google; (b) use a pre-provisioned Google test account on a browser profile that Google trusts; or (c) point TestSprite at a deployed/staging URL with a seeded session cookie.

2. **Live backend dependency.** The frontend is a BFF that proxies to Django (`DJANGO_API_URL`). Even with auth solved, data-driven flows need a running, seeded backend to produce meaningful assertions.

3. **Dev-mode cap.** Only 15 of 45 tests ran. The admin dispute-resolution suite and several client/vendor cases were not exercised. Re-run in production mode for broader coverage.

4. **What is currently verified.** The route guard (`proxy.ts`) is the one confirmed-good behavior: unauthenticated access to protected routes reliably redirects to `/login`. Everything behind auth remains unverified pending a login workaround.

---

### Recommended next step
Add a test-only login bypass (env-gated session cookie) or supply trusted Google test credentials, then re-run in production mode (`npm run build && npm run start`) to lift the cap to 30 and exercise the authenticated client/vendor/admin flows.
