# OpenMarket

Pan-African B2B FMCG trade OS — merchant ordering, distributor fulfillment, affiliate growth, partner logistics, and manufacturer campaigns.

## Apps

| App | Purpose |
|-----|---------|
| `merchant-app/` | Retailer restock + Paystack checkout + settlement sync |
| `distributor-app/` | Wholesaler VWL + fulfillment queue |
| `affiliate-app/` | Partner referrals + commissions |
| `logistics-app/` | Licensed carrier jobs + delivery status |
| `manufacturer-app/` | SmartSubsidy campaigns + upstream portal |
| `website/` | Marketing + registration → platform API |
| `backend/` | Unified API, ledger, Paystack webhooks |

## Git hooks (all projects)

Husky lives at the **workspace root** (`.husky/`). On `npm install` in `website/`, hooks are wired to run typechecks across every app before each commit.

```bash
npm install          # root — installs husky
cd website && npm install   # points git hooks at ../.husky
npm run typecheck    # from root — run all checks manually
```

Install dependencies in each app you work on; apps without `node_modules` are skipped until installed.

## Quick start

### 1. Backend (required)

```bash
cd backend
cp .env.example .env
# Add Paystack test keys from https://dashboard.paystack.com/#/settings/developer
npm start
```

API: `http://localhost:3099`

Without Paystack keys, payments run in **demo mode** (simulate success).

### 2. Website

```bash
cd website && npm run dev   # port 3000
```

Set `PLATFORM_API_URL=http://localhost:3099` (or your deployed API) so registration forms hit `POST /register`. Falls back to `website/.data/leads.json` if the API is unreachable.

### 3. Mobile / web apps

```bash
cd merchant-app && npm run web      # ~8081
cd distributor-app && npm run web   # ~8082
cd affiliate-app && npm run web     # ~8083
cd logistics-app && npm run web     # ~8084
cd manufacturer-app && npm run web  # ~8085
```

Set API URL if not localhost:

```
EXPO_PUBLIC_PLATFORM_URL=http://YOUR_IP:3099
```

## End-to-end wiring

```
Website forms ──POST /register──► Backend (leads + auto-provision affiliates/distributors/manufacturers/logistics)
Merchant checkout ──Paystack──► Order + optional logistics job
Distributor queue ◄──sync──► Order status (syncs logistics job status)
Logistics app ◄──jobs──► Partner advances delivery milestones
Manufacturer app ──campaigns──► Merchant home (active SmartSubsidy banner)
Affiliate ──referrals──► Merchant activation bounty on first verified payment
```

## Paystack payment flow

1. Merchant checkout → `POST /payments/initialize`
2. Merchant pays on Paystack (card, bank, USSD, transfer, QR)
3. Webhook or verify → order `payment_verified` → distributor queue (+ logistics job if requested)
4. Merchant settlement timeline syncs from platform order status
5. First verified payment → affiliate commission (if referred)

## Docs

- [PRODUCT.md](./PRODUCT.md) — strategy, affiliates, GTM
- [DESIGN.md](./DESIGN.md) — design system
- [PLATFORM.md](./PLATFORM.md) — demo walkthrough + API lanes
