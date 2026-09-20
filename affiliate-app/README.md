# OpenMarket Affiliate App

Partner dashboard for merchant recruitment — track sign-ups, activations, and commissions.

## Run

```bash
cd affiliate-app
npm install
npm run web
```

Requires **platform-sync** on port 3099.

## Demo flow

1. **Affiliate** — onboard, get referrer code (e.g. `ADA-X7K2`)
2. **Merchant** — onboarding → enter referrer code on shop setup step
3. **Merchant** — place order, advance settlement to **Settled**
4. **Affiliate** — dashboard shows sign-up → activation → ₦3,000 commission credited

Commission is paid by **OpenMarket** (platform), not merchants or distributors.
