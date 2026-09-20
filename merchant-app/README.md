# OpenMarket Merchant App

Phase 1 merchant ordering flow — offline-aware catalog, cart, virtual-account checkout.

## Run

```bash
cd merchant-app
npm start
```

### Android: Expo Go version

This project is **pinned to Expo SDK 56.0.1** to match the Expo Go build available on Play Store / expo.dev/go (56.0.1).

If you still see a version error:

1. Restart the dev server: `npm start` (stop any old terminal first)
2. Force-close Expo Go on your phone, reopen, scan QR again
3. **Browser fallback:** press `w` in the Expo terminal, or `npm run web`

> SDK 56 Expo Go is not always on Play Store yet. If only 56.0.1 is available, the project stays on 56.0.1 — do not run `expo install --fix` without pinning, or it will bump back to 56.0.9+.

## Full UX flow

### Onboarding
1. **Welcome** — value proposition
2. **Shop setup** — name, **open market**, LGA, optional affiliate referrer code
3. **Preferred distributor** — wholesaler serving that market (not the market itself)
4. **Phone verify** — Nigerian number + OTP (demo)
5. **Ready** — confirm and enter app

### Order → settlement
6. **Home** — restock from preferred distributor (or change supplier)
7. **Catalog** → **Cart** → **Checkout** (virtual account)
7. **Settlement** — 6-step timeline: payment → split ledger (95/5) → inventory → runner → delivery → settled

### Shop stock (Phase 1.5)
- Settled orders **auto-add SKUs** to shop ledger
- **Record sales** — one-tap "Sold 1" per item
- **Low stock** banner → reorder prompt

### Other
- **Order history** — all orders with status
- **Profile** — shop details, reset onboarding (demo)

## Demo controls

- **Toggle offline demo** on catalog screen — simulates optimistic local save with pending sync count
- **Simulate payment received** on checkout — unlocks confirm button
