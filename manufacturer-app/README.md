# OpenMarket Manufacturer App

Upstream portal for demand telemetry and SmartSubsidy trade campaigns.

## Run

```bash
cd manufacturer-app
npm install
npm run web
```

Set `EXPO_PUBLIC_PLATFORM_URL` if the API is not on `http://localhost:3099`.

## Flow

1. Onboard → `POST /manufacturers`
2. Launch campaign → `POST /campaigns` (48-hour window)
3. Active campaigns surface via `GET /campaigns/active?market=...` for merchant pricing (Phase 2)
