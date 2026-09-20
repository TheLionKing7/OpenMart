# OpenMarket Platform API

Unified backend for all lanes — merchant, distributor, affiliate, logistics partner, manufacturer, and website registration.

Use `backend/` (not the legacy `platform-sync/` folder).

## Run (6 terminals)

```bash
# Terminal 1 — API + Paystack
cd backend && npm start

# Terminal 2 — website (registration → API)
cd website && npm run dev

# Terminal 3 — distributor (add products after onboarding)
cd distributor-app && npm run web

# Terminal 4 — merchant
cd merchant-app && npm run web

# Terminal 5 — affiliate
cd affiliate-app && npm run web

# Terminal 6 — logistics partner (optional)
cd logistics-app && npm run web

# Terminal 7 — manufacturer (optional)
cd manufacturer-app && npm run web
```

Platform API: `http://localhost:3099`  
State persists in `backend/platform-state.json`.

## API lanes

| Lane | Key endpoints |
|------|----------------|
| **Website** | `POST /register`, `GET /leads` (admin token) |
| **Merchant** | `POST /payments/initialize`, `GET /orders/:id`, `GET /campaigns/active` |
| **Distributor** | `POST /distributors`, `PUT /distributors/:id/catalog`, `PATCH /orders/:id` |
| **Affiliate** | `POST /affiliates`, `POST /referrals`, `GET /affiliates/:code/dashboard` |
| **Logistics** | `POST /logistics/partners`, `GET /logistics/partners/:id/dashboard`, `PATCH /logistics/jobs/:id` |
| **Manufacturer** | `POST /manufacturers`, `POST /campaigns`, `GET /manufacturers/:id/dashboard` |

## Demo flow

### Core trade loop

1. **Distributor** — onboarding (coverage, logistics terms) + Inventory → add SKU
2. **Merchant** — pick distributor, catalog from live VWL, checkout with Paystack
3. **Distributor** — fulfillment queue advances order status
4. **Merchant** — settlement screen polls platform order status

### Website → platform

5. Submit any audience form on the website → `POST /register` provisions affiliate/distributor/manufacturer/logistics records when applicable

### Logistics loop

6. Register a **logistics partner** (website or logistics-app onboarding)
7. **Merchant** checks “Partner logistics” at checkout (or distributor has `hasLogistics`)
8. On payment success → backend creates logistics job (`pending_quote`)
9. **Logistics app** — advance job through quote → pickup → in transit → delivered
10. **Distributor** order detail shows logistics job id when requested

### Manufacturer loop

11. **Manufacturer app** — onboard + launch SmartSubsidy campaign for a market cluster
12. **Merchant** home shows active campaign banner via `GET /campaigns/active?market=...`

### Affiliate loop

13. **Affiliate** — onboard → share referrer code
14. **Merchant** — enter code at shop setup
15. First verified payment → ₦3,000 activation bounty on affiliate dashboard (activated server-side at payment finalization)

## Environment

**Backend** (`backend/.env`):

```
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...
PORT=3099
ADMIN_TOKEN=change-me   # required for GET /state and GET /leads
```

**Website** (Vercel / `.env.local`):

```
PLATFORM_API_URL=https://your-api.example.com
```

**Apps**:

```
EXPO_PUBLIC_PLATFORM_URL=https://your-api.example.com
```

## Why distributors must record inventory

Smart routing needs three signals from each wholesaler:

1. **Coverage** — markets/regions they serve (onboarding)
2. **Terms** — logistics, lead time, ordering conditions (onboarding)
3. **VWL catalog** — SKU, price, quantity on hand, reserved (inventory ledger)

Without (3), the platform cannot know who has stock or rank distributors for a merchant order.
