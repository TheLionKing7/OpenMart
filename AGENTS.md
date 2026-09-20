# AGENTS.md — OpenMarket

Guidance for AI coding agents working in this workspace. Read this fully before making changes.

## Project overview

OpenMarket is a pan-African B2B FMCG trade OS (Phase 1: Nigeria). It is **not** a consumer storefront — it coordinates merchant restock ordering, distributor fulfillment via a Virtual Warehouse Ledger (VWL), Paystack payment verification, affiliate-driven merchant acquisition, partner logistics, and manufacturer SmartSubsidy campaigns.

Seven deliverables live in this workspace:

| Path | What it is |
|------|-----------|
| `backend/` | Unified platform API (Node, zero dependencies) — ledger, Paystack webhooks, registration |
| `website/` | Next.js marketing site + registration forms that proxy to the API |
| `merchant-app/` | Expo app — retailer restock, checkout, settlement tracking |
| `distributor-app/` | Expo app — wholesaler VWL, inventory, fulfillment queue, payouts |
| `affiliate-app/` | Expo app — partner referrals + commissions |
| `logistics-app/` | Expo app — carrier job queue + delivery milestones |
| `manufacturer-app/` | Expo app — SmartSubsidy campaigns + manufacturer dashboard |
| `shared/` | TypeScript domain types, API client, routing logic shared by the Expo apps |

Supporting dirs: `scripts/` (workspace automation), `assets/` (market photos), `brand/` (logo), `documents/` (business docs, `.docx`), `platform-sync/` (**legacy** — do not use; its `npm start` just runs `node ../backend/server.mjs`).

Product intent, domain model, and design language are documented in `README.md`, `PRODUCT.md`, `PLATFORM.md` (demo walkthrough + API lanes), and `DESIGN.md` (design system). Read the relevant one before UI or product work.

## Repository and workspace layout

- There is **no git repo at the workspace root**. `website/` and `merchant-app/` are independent git repositories (the website deploys from its own repo root — see Deployment). Husky is set up to work with either layout (`scripts/setup-husky.mjs` probes both locations).
- This is **not** an npm-workspaces monorepo. Every app has its own `package.json` and its own `node_modules`; install dependencies per app you touch.
- `shared/` is consumed by the Expo apps through **relative imports** (e.g. `import { PlatformOrder } from '../../../shared/types'`). It is not a published package. Editing `shared/` affects all five apps.

## Technology stack

- **Backend**: Node.js ESM (`.mjs`, `"type": "module"`), `node:http` only — no framework, no runtime deps. State persists in `backend/platform-state.json` (single JSON file, read per request, rewritten after each mutation).
- **Website**: Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS 3, PostCSS/Autoprefixer.
- **Mobile apps**: Expo SDK 56, React Native 0.85, React 19.2, TypeScript (`expo/tsconfig.base`, `strict: true`), React Navigation (native-stack), `@react-native-async-storage/async-storage` for on-device state. `merchant-app/AGENTS.md` warns: Expo has changed — read the versioned docs at `https://docs.expo.dev/versions/v56.0.0/` before writing Expo-specific code.

## Build, run, and verify

### Backend (run first — everything talks to it)

```bash
cd backend
cp .env.example .env     # add Paystack test keys (optional)
npm start                # http://localhost:3099  (npm run dev = node --watch)
```

Without `PAYSTACK_SECRET_KEY`/`PAYSTACK_PUBLIC_KEY`, payments run in **demo mode**: checkout redirects to a local `/pay/demo` page and `POST /payments/:ref/simulate-success` finalizes the order.

### Website

```bash
cd website && npm install && npm run dev   # http://localhost:3000
```

### Expo apps (web targets used for local dev)

```bash
cd merchant-app && npm run web      # each app on its own port (~8081–8085)
```

Each app also has `npm start` (Expo dev server), `npm run android`, `npm run ios`.

### Verification — there is no test suite

There are **no unit/integration tests and no lint config anywhere in this repo**. The only automated gate is **TypeScript typechecking**, run per project:

```bash
npm run typecheck    # from website/ or any *-app/ — tsc --noEmit
```

From the workspace root, `npm run typecheck` runs `scripts/pre-commit-check.mjs`, which typechecks `website/` and every installed Expo app and syntax-checks the backend files (`node --check`). Apps without `node_modules` (currently `logistics-app/` and `manufacturer-app/`) are **skipped** until you install their deps. The same script runs as a **husky pre-commit hook** wired by `scripts/setup-husky.mjs` (triggered by `npm install` at root or in `website/`; skipped under `CI`/`VERCEL`).

Backend smoke check: `GET /health` returns `{ ok, paystack, demoPayments }`.

## Runtime architecture

All traffic funnels through the backend (default `http://localhost:3099`, override per client):

```
website forms ──POST /register──► backend (leads + auto-provision affiliate/distributor/
│                                  manufacturer/logistics records when applicable)
merchant checkout ──Paystack──► order payment_verified ──► distributor queue
                                                         └─► logistics job (if requested)
distributor PATCH /orders/:id ◄──sync──► logistics job status
manufacturer POST /campaigns ──► merchant home banner via GET /campaigns/active
affiliate referrer code ──► ₦3,000 bounty on referred merchant's first verified payment
```

- **API lanes** (`backend/server.mjs`): website (`/register`, `GET /leads` — admin-token gated), merchant (`/payments/*` — `/payments/initialize` re-prices every line from the distributor VWL catalog server-side; clients cannot set totals, `/orders/:id`, `/campaigns/active`), distributor (`/distributors`, `/orders`), affiliate (`/affiliates`, `/referrals`), logistics (`/logistics/partners`, `/logistics/jobs`), manufacturer (`/manufacturers`, `/campaigns`). `GET /state` (full ledger dump) is admin-token gated. `PLATFORM.md` has the endpoint table.
- **Backend module split**: `server.mjs` (routing + state read/write), `paystack.mjs` (Paystack initialize/verify + webhook HMAC signature check), `payments.mjs` (order draft, finalize, `ACTIVATION_BOUNTY_NGN = 3000`), `extensions.mjs` (lead ingestion/provisioning, logistics job lifecycle, dashboards, campaign matching).
- **Website registration** (`website/app/api/register/route.ts`) proxies to `POST $PLATFORM_API_URL/register`; if the API is unreachable it falls back to writing `website/.data/leads.json`.
- **Expo app structure** (merchant-app is the reference): `App.tsx` wires providers (`PlatformContext` = API connectivity + distributor/campaign data, `MerchantContext` = profile, `SyncContext` = offline state, `CartContext`), `src/navigation/AppNavigator`, `src/screens/*`, `src/components/*`, `src/data/*`, `src/theme`. Other apps follow the same `src/{screens,components,context,navigation,theme,utils}` layout.
- **Offline-first**: the merchant app models sync honestly — `SyncContext` tracks `synced | offline | error`, a pending-change count, and a persistent top **SyncBar** ("Offline Mode — Changes Saved Locally (N Pending)"). Optimistic local state is shown immediately and never hidden; payment/settlement status is first-class UI.
- Client base URLs: `EXPO_PUBLIC_PLATFORM_URL` for apps, `PLATFORM_API_URL` for the website. Defaults are `http://localhost:3099`.

## Domain conventions

- **Money**: naira (`*Ngn`) as numbers inside the platform; converted to **kobo** only at the Paystack boundary (`Math.round(totalNgn * 100)`).
- **Settlement**: distributors get a **95% payout** (`distributorPayoutNgn`), platform fee is 5% (`platformFeeNgn`); logistics fee rate is 3% (`LOGISTICS_FEE_RATE` in `backend/extensions.mjs`).
- **Order statuses** (`PlatformOrderStatus` in `shared/types.ts`): `payment_verified → allocated → ready_to_pack → out_for_delivery → completed`. Distributors advance via `PATCH /orders/:id`; the backend mirrors the status onto any linked logistics job.
- **Logistics job statuses**: `pending_quote → quote_accepted → awaiting_pickup → in_transit → delivered` (or `cancelled`).
- **IDs/references**: `order-${Date.now()}`, order refs `OM-<base36>`, `slugId()` helper for affiliate/manufacturer/logistics ids. Backend upserts are idempotent (match by id; `POST /orders` returns the existing order on duplicate id).
- **Affiliate attribution**: referrer code captured at merchant onboarding; the referral activates and credits a flat ₦3,000 commission only when the referred merchant's first order payment is finalized (`finalizePayment` in `backend/payments.mjs` — there is no client-reachable activation endpoint) (bounty defined in both `backend/payments.mjs` and `shared/affiliate.ts` — keep them in sync).
- **Distributor routing signals** (`shared/routing.ts`): market coverage, terms, and live VWL catalog (`quantityOnHand - reserved` = available). A distributor who serves the market gets a base score of 50; full SKU availability is required for `canFulfillAll`.
- **Markets vs distributors**: open markets (Oke-Arin, Idumota, Mushin, Alaba…) are geographic demand clusters, never fulfillment entities. Distributors are separate businesses that own the VWL. Never route an order to a market.

## Code style guidelines

- Language: **English** everywhere (code, comments, docs, UI copy).
- Backend is plain ESM with a **hand-rolled router** — keep that style; do not introduce Express or other dependencies without explicit approval (the zero-dependency design is intentional for low-friction demo/ops).
- TypeScript `strict` everywhere; match each project's existing idioms (see neighboring files) rather than importing your own patterns.
- Follow `DESIGN.md` for any UI work: utility-first, high-density, list-over-grid, system font stacks only, no decorative gradients/glassmorphism/hero metrics, oversized touch targets (≥48dp), outdoor-glare readability, reduced-motion support. Retailer surfaces and the manufacturer portal deliberately use different paradigms — do not blend them.
- Backend edits that add state fields must extend `emptyState()`/defaults (via `extensionDefaults()`) so old state files still load.

## Environment variables and secrets

- `backend/.env` (from `backend/.env.example`): `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`, `PORT` (default 3099), `ALLOW_PAYMENT_SIMULATE` (dev-only gate for the simulate-success endpoint), `ADMIN_TOKEN` (bearer token required for `GET /state` and `GET /leads`; without it they answer 403).
- `website/`: `PLATFORM_API_URL` (Vercel env or `.env.local`).
- Expo apps: `EXPO_PUBLIC_PLATFORM_URL`.
- `.env` files are gitignored — never commit keys. The backend loads `.env` itself (simple parser in `server.mjs`); no dotenv package.

## Security considerations

- Paystack webhooks are verified by HMAC signature (`x-paystack-signature`) before any state change — preserve this check.
- Payment simulation is only allowed when Paystack is not configured or `ALLOW_PAYMENT_SIMULATE=true`; keep it that way.
- This backend is a **demo-grade local API**, not production-hardened: CORS is `*` and auth does not exist outside the two admin dumps. `GET /state` (full ledger, incl. phone numbers) and `GET /leads` (lead PII) require the `ADMIN_TOKEN` bearer — they answer 403 when the token is unset or mismatched. Do not assume it is deployable as-is to a public host; flag rather than silently "fix" when a task assumes production security.
- `backend/platform-state.json` is runtime state with PII — do not treat it as source data to edit by hand.

## Deployment

- **Website** → Vercel (framework preset Next.js; `website/vercel.json` sets build/install commands). Note: the website deploys from its own git repo; Vercel project root must stay the repo root (see `website/README.md`).
- **Backend**: plain `node server.mjs` process; set env vars from `.env.example` on the host. No Dockerfile/CI config exists.
- **Expo apps**: distribute via Expo / EAS (no EAS config committed yet).

## Workspace helper scripts (`scripts/`)

- `pre-commit-check.mjs` — the typecheck gate described above.
- `setup-husky.mjs` — wires git hooks (root or nested-repo layout; no-op in CI/Vercel).
- `sync-brand.mjs` — copies `brand/logo.png` into every app's `assets/`. Run after logo changes.
- `sync-market-assets.mjs` — copies market photos from `assets/` into `website/public/assets/`. Run after adding market images (filenames are referenced by `website/data/markets.ts`).
