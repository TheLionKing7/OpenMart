# Design System — OpenMarket

Multi-tier design system. **Retail/distributor surfaces:** high-density, utility-first commerce — Shopify Polaris mental models + **Material Design 3** on React Native (Tailwind utility-first). **Manufacturer upstream portal:** enterprise-grade web SaaS — Polaris analytical grids + deep visualization (Tremor UI or Shadcn on Next.js).

## Theme

- **Mode:** Light primary (outdoor glare readability); support high-contrast variant
- **Strategy:** Restrained — tinted neutrals + one confident accent; no decorative gradients
- **Fonts:** System stacks only — `system-ui`, Roboto, Segoe UI (no web-font loading on merchant path)
- **Density:** High — data-dense lists, tables, fulfillment queues over card grids

## Color Tokens (directional)

| Role | Intent |
|------|--------|
| `ink` | Primary text — high contrast on light surfaces |
| `surface` | Card/list row backgrounds — minimal elevation |
| `bg` | App background — true off-white or chroma-0 neutral, not cream/sand AI default |
| `accent` | Primary actions, links — single brand color, ≤10% surface coverage on utility screens |
| `muted` | Secondary labels — must still meet 4.5:1 on surface |
| `warning` | Amber — dynamic price shifts within last hour |
| `success` | Sync confirmed, payment verified |
| `pending` | Optimistic local state, offline queue |

Use OKLCH when defining tokens. Avoid warm cream body backgrounds.

## Typography

- Body: system stack, readable at small sizes on low-DPI screens
- Line length: cap prose at 65–75ch where applicable
- Display: restrained — hero/display max ≤6rem; letter-spacing ≥ -0.04em
- Checkout/payment numbers: **massive, clear** — virtual account copy is a primary UI pattern

## Layout & Spacing

- **Single-thumb operational layouts** — primary actions in thumb zone
- **List over grid** — image-agnostic wholesale replenishment lists, not catalog grids
- Flexbox for 1D rows; Grid only when truly 2D
- No nested cards; no identical icon+heading+text card grids
- Semantic z-index scale (dropdown → sticky → modal → toast)

## Core Components

### Network-Aware Context Bar (persistent top bar)

| State | Copy pattern |
|-------|----------------|
| Synced | 🟢 Synced (Last updated: X mins ago) |
| Offline | 🟡 Offline Mode — Changes Saved Locally (N Pending) |
| Error | 🔴 Sync failed — tap to retry |

Reduces merchant anxiety; confirms orders are safe on-device.

### Virtual Account Copy-Paste Module

- Massive typography for bank name + virtual account number
- Single-tap **Copy Number & Open Bank App** deep link
- Clear paid / pending / expired states

### High-Density List Row (wholesale SKU)

```
┌────────────────────────────────────────────────────────┐
│ Dangote Sugar (50kg Bag)                               │
│ SKU: DG-SUG-50 | Stock: 140 Bags Available             │
│ ₦85,000 / Bag    [ − ]  [ 10 ]  [ + ]                  │
└────────────────────────────────────────────────────────┘
```

- SVG or text glyphs only — no external product images on list path
- Amber price text when dynamic price shifted within last hour
- Bulk quantity steppers oversized for thumb use

### Affiliate / Partner Surfaces

- Same utility-first density as merchant app — no marketing-template hero metrics
- Trackable referral links, earnings, and merchant status in table/list format
- AI-assisted copy suggestions presented as editable drafts, not auto-sent spam

### Manufacturer Portal (Upstream Enterprise Console)

Deliberate **UI paradigm pivot** from mobile merchant flows. Office-monitor, multi-pane, analytics-first.

| Dimension | Retailer App (WhatsApp/Mobile) | Manufacturer Portal (Enterprise Web) |
|-----------|-------------------------------|--------------------------------------|
| Data visualization | None — single text values, basic lists | Time-series demand curves, LGA heatmaps, SKU velocity arrays |
| Operational control | Single-item adds, optimistic wallet | Multi-million ₦ campaign budgets, demographic targeting, webhook logs |
| Design density | High contrast, thumb-friendly, outdoor glare | Lower contrast, deep tabular views, multi-pane navigation |

**Stack:** Next.js + Polaris analytical grid components + Tremor UI or Shadcn for charts.

**SmartSubsidy Campaign Builder**

- Campaign form: SKU, subsidy amount, geographic target (LGA/cluster), duration, pre-funded wallet balance
- Live campaign status: spend rate, redemption count, remaining budget
- Merchant-facing subsidy surfaces as inline order discount: "Sponsored by Manufacturer — ₦500 off"

**Telemetry Dashboard**

- Aggregated, anonymized demand by geographic cluster (no individual merchant PII)
- Market velocity indexes, category share trends, stockout risk signals
- Read-only — manufacturers consume event-stream aggregates, never write to transactional DB

## WhatsApp (SmartBridge) UI Spec

Meta-compliant interactive components — merchants navigate with taps, not long text:

- **List Messages** — category/hub selection, max 10 options
- **Reply Buttons** — `[Confirm Order]`, `[View Account Details]`, `[Speak to Agent]`

## Motion

- Intentional, minimal — no bounce/elastic
- Ease-out (quart/quint/expo)
- `@media (prefers-reduced-motion: reduce)` — crossfade or instant
- Never gate content visibility on animation completion

## Do

- Show sync/payment state prominently (retailer/distributor tiers)
- Use Polaris-style fulfillment queues and inventory tables on mobile
- Map RN components to M3 for native Android performance
- Test on Tecno/Infinix/Itel class devices
- Use interactive charts and heatmaps on manufacturer portal only
- Apply manufacturer subsidies inline at order intent — visible, trustworthy, not hidden

## Don't

- Gradient text, glassmorphism defaults, hero-metric templates
- Grid catalog with large product photography (retailer replenishment path)
- Tiny signal icons without sync context
- Web fonts, heavy drop shadows, infinite scroll pagination on mobile merchant path
- Consumer e-commerce checkout patterns
- Treat manufacturers as marketplace sellers (listing SKUs, fulfilling kiosk orders)
- Force mobile high-contrast outdoor UI onto enterprise analytics screens
- Expose individual merchant/wholesaler identity in manufacturer telemetry views
