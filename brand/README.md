# OpenMarket brand assets

Official logo: horizontal wordmark with Africa emblem (forest green + gold).

```
brand/logo.png
```

Sync to all apps after updating:

```bash
node scripts/sync-brand.mjs
```

**Brand colors** (from logo):
- Forest green: `#1B5E3B` (primary)
- Metallic gold: `#C9A227` / `#D4AF37` (accent)

## Website lockup

The live site uses a single SVG with **Africa** baked in under **MARKET**:

```
website/public/logo.svg
```

`BrandLogo.tsx` renders this file only — no CSS text overlay.
