# OpenMarket Distributor App

Phase 1 distributor fulfillment ledger — high-density mobile UI for tier-1 wholesalers.

## Run

```bash
cd distributor-app
npm start
```

Web: `npm run web` or press `w` in the Expo terminal.

Pinned to **Expo SDK 56.0.1** (same as merchant-app / Expo Go 56.0.1).

## UX flow

### Onboarding (self-service — no preloaded supplier list)
1. **Welcome** — what you'll set up
2. **Business** — name, stall/warehouse, LGA, operator, phone
3. **Coverage** — markets and regions you serve (comma-separated or chip suggestions)
4. **Logistics & ordering** — delivery yes/no, minimum lead time (same day → 7 days), ordering conditions
5. **Review** — confirm and open ledger (starts empty)

### Fulfillment
6. **Dashboard** — pending orders, payouts, your published ordering terms
7. **Fulfillment queue** — Allocate → Pack → Delivery → Done
8. **Order detail** — line items, 95/5 split, advance status
9. **Inventory** — VWL on-hand + reserved
10. **Payouts** — 95% credits on allocation
11. **Profile** — business, coverage, logistics terms, reset onboarding

## Demo note

Onboarding no longer picks from a seed supplier list. You enter your own business details. The queue and inventory start empty until merchant orders arrive or you add stock manually.

Reset via **Profile → Reset onboarding** to walk through again.
