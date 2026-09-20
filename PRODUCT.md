# Product

## Register

product

## Users

**Primary (Phase 1):** Informal corner retailers and open-market shop owners in Nigerian FMCG hubs (Mushin, Balogun, Oke-Arin, Idumota, Alaba). They operate on entry-to-mid-tier Android devices, often in poor network conditions, frequently one-handed while serving customers.

**Secondary:** Tier-1 distributors and virtual-warehouse operators who fulfill orders; affiliate partners and referrers who drive merchant acquisition through AI-assisted outreach.

**Upstream (not transactional users):** Manufacturers (Unilever, Nestlé, Dangote, local industrial mills) are **Upstream Network Beneficiaries and Insight Users** — not marketplace sellers listing SKUs or fulfilling kiosk-level orders. They operate at FTL/container scale. OpenMarket treats them as a premium data-and-subsidy tier: read-only telemetry consumers and campaign sponsors, not write-loop participants in the transactional ledger.

**Context:** Users restock FMCG wholesale via mobile — not casual shopping. Many already order through WhatsApp voice notes and bank transfers. Success means zero-friction replenishment, visible payment status, and confidence that orders survive network drops. Manufacturers succeed when they gain last-mile demand visibility, route trade promotions directly to verified kiosks (bypassing distributor margin capture), and align production to real depletion signals.

## Product Purpose

OpenMarket is a pan-African B2B digital trade operating system — not a consumer storefront. It coordinates localized distribution, virtual inventory, programmatic settlement, and conversational ordering (WhatsApp SmartBridge) for informal trade networks.

Phase 1 targets Nigeria FMCG: asset-light virtual warehouse ledger, offline-first merchant ordering, and instant payment verification via virtual accounts.

### Domain model: markets vs distributors

**Open markets** (Oke-Arin, Idumota, Balogun, Alaba, Mushin) are **geographic trade clusters** — where a retailer’s shop sits and where demand aggregates. They are **not** fulfillment entities and do **not** own the Virtual Warehouse Ledger.

**Distributors** (tier-1 wholesalers) are **separate businesses** that hold stock, fulfill orders, receive the 95% payout, and operate the distributor fulfillment ledger. One market has many distributors; one distributor may serve multiple markets.

| Entity | Role | Order routing |
|--------|------|----------------|
| **Market** | Retailer location, demand clustering | Discovery only — never the fulfillment target |
| **LGA** | Admin / geo zone | Routing and analytics |
| **Distributor** | VWL owner, fulfills, settles | **Catalog, stock, payment, settlement attach here** |
| **Merchant** | Retailer | Saves **preferred distributor** (usual wholesaler) |

**Merchant UX:** Onboarding captures market (where shop is) **and** preferred distributor (who they buy from). Restock defaults to preferred distributor; change supplier is explicit. Merchants never “connect with” distributors — no calls, no reconciliation — but they **do** identify their usual wholesaler once.

**Platform routing (future):** System may recommend or auto-assign a distributor using market + stock + price + subsidies; merchant confirms or keeps preferred default. Market alone is never sufficient for routing.

**AI-powered affiliate marketing** is a first-class growth surface: referrers and partners use AI-assisted tools to recruit merchants, share trackable offers, and convert informal traders into the network — without generic consumer-marketing tropes. Affiliate flows should feel as capable and trustworthy as the merchant app itself.

### Affiliates: definition and who pays

An **Affiliate** is an independent growth partner — market connector, trade-association rep, delivery agent, former wholesaler staff, or community operator — who uses their **relationships** to bring **verified merchants** (Phase 1) or **verified distributors** (Phase 1.5 wedge) onto OpenMarket. They earn a **definitive commission** when a referred party completes a qualified action, tracked via a **referrer code** at onboarding.

Affiliates are **not** selling FMCG themselves and are **not** distributors. They do not hold stock, fulfill orders, or appear in the 95/5 settlement split on trade.

| Question | Answer |
|----------|--------|
| **Who pays the affiliate?** | **OpenMarket (the platform)** — primary payer in Phase 1 |
| **Who does *not* pay?** | Merchants (no surcharge on orders) · Distributors (95% payout unchanged on standard trade) |
| **Where does commission come from?** | Platform acquisition budget — carved from the **5% platform fee** pool, or from pilot marketing budget while fees are waived |
| **When is commission earned?** | On **qualified activation**, not raw sign-up: referred merchant completes **first settled order** within the attribution window (e.g. 30 days) |
| **Typical Phase 1 bounty** | Flat ₦ per activated merchant (e.g. ₦2,000–₦5,000) or capped % of platform fee on first order — **not** an unlimited lifetime rev-share on every carton |

**Phase 1 focus:** affiliates recruit **merchants** in anchor markets (Oke-Arin, Mushin, Idumota). This matches GTM step 3 — build merchant demand before approaching tier-1 wholesalers.

**Phase 1.5 optional:** separate **distributor-recruitment** bounty when a referred wholesaler registers VWL + fulfills first platform order. Still paid by **OpenMarket**, not by other distributors or merchants.

**Phase 2+ (manufacturer co-pay):** SmartSubsidy campaigns may **split** acquisition cost with a manufacturer (e.g. Nestlé funds half the affiliate bounty for milo-category merchants in Yaba). Manufacturer co-pay is explicit, campaign-scoped, and never deducted from distributor 95%.

**Attribution rules (product):**

- Referrer code captured at merchant onboarding (`referrerCode` on profile)
- One affiliate per merchant; first-touch wins within window
- Payout to affiliate wallet after `order.settled` event on referred merchant’s first order
- Affiliates see a dashboard: sign-ups, activations, earned vs pending commission

**Anti-patterns:** MLM downlines, spam blast outreach, commission taken from distributor settlement, or affiliates posing as official OpenMarket employees without disclosure.

Co-equal surfaces: **product UI** (merchant app, distributor tools), **brand/acquisition UI** (landing, affiliate dashboards, partner onboarding), and **upstream enterprise UI** (manufacturer telemetry and SmartSubsidy campaign console). Default register is product; brand register applies per-task for marketing and affiliate surfaces; manufacturer portal uses a deliberate enterprise-analytics paradigm (see DESIGN.md).

### Upstream value chain (manufacturers)

Manufacturers suffer the **Supply Chain Black Box** once pallets leave the factory:

- **Zero last-mile visibility** — no real-time signal on kiosk depletion, LGA-level demand, or localized stockouts
- **Hijacked trade promotions** — distributor margin capture prevents discounts reaching neighborhood retailers
- **Erratic production scheduling** — factories guess cycles without consumer depletion data, causing deadstock or stockouts

**Architectural integration:** Supply Chain Telemetry & Programmatic Promotion Engine — a read-only event domain consuming `order.finalized` and `inventory.depleted` from Redpanda, aggregating anonymized volumes by geographic cluster (LGA) into TimescaleDB. **SmartSubsidy Engine** lets manufacturers fund targeted retail subsidies via API (e.g. "₦500 off every carton in Yaba for 48h to verified kiosks"), applied in real time on WhatsApp order intent with merchant-facing "Sponsored by Manufacturer" messaging.

**Monetization vectors:** DaaS subscriptions (market velocity, share-of-category), 1–2.5% campaign execution fees on SmartSubsidy volume, and quarterly AI-generated supply/demand forecasting briefs.

### Merchant shop stock (Phase 1.5)

Light depletion tracking — not a full POS. Settled orders auto-add SKUs to the merchant's shop ledger; **Sold 1** taps decrement stock and trigger low-stock reorder prompts. Feeds future `inventory.depleted` telemetry and Trust Index without spreadsheet inventory management.

### Distributor / warehouse onboarding (GTM)

Distributors are **fulfillment partners**, not marketplace sellers listing individual kiosk orders. Onboard via the **Virtual Warehouse Ledger (VWL)** — asset-light digitization of stock they already hold.

**Value proposition to distributors**

| Pain today | OpenMarket offer |
|------------|----------------|
| Manual payment reconciliation | 95% payout on `Payment_Verified` — no chasing transfers |
| Opaque demand | Order stream from verified retailers in their service area |
| Cash flow lag | Programmatic split ledger, instant wallet credit |
| No digital channel | WhatsApp SmartBridge + merchant app orders without building their own |

**How to get the first distributor on board (Phase 1 wedge)**

1. **Anchor one market** — single high-density open market (e.g. Oke-Arin, Mushin, Idumota). Geography only; do not multi-city launch.
2. **Onboard 1–2 distributors inside that market** — named wholesalers with VWL, not the market itself.
3. **Lead with merchant demand** — sign 10–20 retailers first (affiliate/referrer or market-floor pilots), then approach the tier-1 wholesaler: *"X verified orders/week ready to route through you."*
4. **Minimum integration** — start with daily stock sheet + WhatsApp confirm; graduate to VWL API/webhook. No warehouse capex required.
5. **Distributor UI** — high-density mobile ledger (inventory adjustments, fulfillment queue, payout status) — Polaris-style, not consumer storefront.
6. **Pilot economics** — waive platform fee for first 90 days; prove payment speed and order volume; introduce 5% after trust is established.
7. **Expand** — second market/distributor pair only after settlement + VWL sync is reliable; manufacturer SmartSubsidy follows merchant density.

**Who to target first:** Tier-1 open-market FMCG wholesalers already serving informal retailers — they feel reconciliation pain daily and gain instant payment without changing physical operations.

## Brand Personality

**Steady · Capable · Grounded**

Voice is clear, predictable, and utility-first — like infrastructure that works in the real world, not a hype deck. Merchants should feel speed, trust, and calm reliability: their stock is handled, payments just work, and the app stays usable when the network doesn't.

## Anti-references

- Generic SaaS (purple gradients, glass cards, hero metrics, gradient text)
- Consumer e-commerce storefronts (Jumia/Konga grid-catalog vibes)
- Overdesigned fintech (flashy animations, neon, crypto-bro aesthetics)
- Desktop enterprise ERP (SAP-style dense tables, tiny text, mouse-first)
- High-decoration retail UI (large product imagery, infinite scroll, bandwidth-heavy animations)

**Positive reference lane:** B2B trade craft like OmniRetail/Sabi (distributor-first, functional) and OroCommerce (structured B2B commerce, professional wholesale mental models) — a fresh breath away from the old norm.

## Design Principles

1. **Data over decoration** — Every pixel conveys utility. No ornamental gradients, heavy shadows, or web-font bloat on the merchant path.
2. **Offline-first honesty** — UI reflects local state instantly (optimistic ledger). Never hide pending sync; always show what's saved on-device vs. confirmed server-side.
3. **Single-hand, outdoor-ready** — Oversized touch targets (≥48dp), high-contrast for glare, thumb-zone primary actions for market-floor use.
4. **Payment clarity is product design** — Virtual account numbers, copy actions, and settlement status are first-class UI, not afterthoughts.
5. **Affiliate growth without spam** — AI-assisted partner tools prioritize trust, trackability, and merchant benefit; never feel like MLM or aggressive growth-hack landing pages.
6. **Practice what we preach** — The platform's own UI must embody the resilience we sell: lean, defensive, resilient under 2G/3G and low-RAM Android.
7. **Right UI for the tier** — Retailers get zero-bandwidth WhatsApp/mobile loops; distributors get high-density mobile ledgers; manufacturers get enterprise web analytics — never force one paradigm across the chain.
8. **Manufacturers are partners, not sellers** — No FTL manufacturers fulfilling 5-carton kiosk orders; upstream integration is telemetry, subsidies, and insight — not transactional marketplace listing.

## Accessibility & Inclusion

- **WCAG 2.1 AA** baseline for color contrast, focus, and semantics
- **Practical mobile-first:** large touch targets, high contrast (Material 3 dynamic color / high-contrast modes), system font stacks for performance
- **Reduced motion** respected on all animations
- **Low-end Android** (Tecno, Infinix, Itel) as the primary test target — zero frame drops, minimal payload
- **Offline/low-bandwidth:** delta-only sync, image-agnostic lists, SVG/text glyphs over heavy imagery
- **Outdoor readability** for open-market glare environments
