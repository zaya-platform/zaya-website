# 06 · Brand & Design Tokens (from the official assets)

Everything here is **extracted directly** from the founder-supplied 2026-07-07 logo
system in `brand/` (the app icon, horizontal logo, wordmark, animated icon, and the
interactive brand reference). Nothing is invented or redesigned (Part 2).

## ⚑ F1 — Palette discrepancy (must confirm)

The build prompt's **Part 2 placeholder** text describes "deep warm **forest-green**
ground, **emerald** primary, **gold** accent, cream text." The **supplied official
assets** are a **teal / coral / navy** system (below). These disagree. Part 2 also says
the supplied assets are the **single source of truth** and must not be redesigned — so
this plan builds on the **official teal/coral/navy**. **Please confirm**, or supply the
green/gold brand guideline if that is the intended final palette. Because everything is
tokenised, switching is a one-file change.

## 1. Color tokens (official)

| Token | Hex | Role |
|---|---|---|
| `--teal` | `#0EA5A4` | **Primary** — brand, links, primary accents, tagline on light |
| `--teal-bright` | `#13B7B4` | Gradient start (app-icon pin) |
| `--teal-deep` | `#0B8B8A` | Gradient end · primary hover (`#0C8F8E`) |
| `--coral` | `#FF7A45` | **Accent** — "APP", key CTAs, highlights, the pin's Z dot |
| `--navy` | `#1E2A4A` | **Ink / ground** — wordmark, body text, dark hero ground |
| `--amber` | `#F4A261` | Secondary accent (warm Ethiopian gold-orange) |
| `--plum` | `#6D5DD3` | Tertiary accent (sparingly — categories/illustration) |
| `--mint` | `#5DCAA5` | Tagline/accent **on dark** grounds |
| `--mint-pale` | `#EAFBF7` | Tagline/accent **on teal** grounds |
| `--cloud` | `#F4F7F8` | Light section background |
| `--line` | `#E4E8EC` | Borders / dividers |
| `--ink-muted` | `#5B6470` | Secondary text |
| `--ink-faint` | `#8A929C` | Captions / hints |
| `--white` | `#FFFFFF` | Surfaces, on-dark text |

**Surface treatments (from the brand file's background swatches):**
- On **cloud/white**: wordmark `--navy`, tagline `--teal`.
- On **navy**: wordmark `#FFFFFF`, tagline `--mint`.
- On **teal**: wordmark `#FFFFFF`, tagline `--mint-pale`.

**Contrast:** navy-on-white, white-on-navy, and white-on-teal all pass AA for text;
coral is used for emphasis/large text and interactive fills (verify AA per use;
coral-on-navy and white-on-coral are the safe pairings). The token doc will ship with a
checked contrast matrix.

## 2. Typography
- **Poppins** (400/500/600/700) — Latin (headings, body, UI). Geometric, warm, modern.
- **Noto Sans Ethiopic** (500/600/700) — Amharic & Tigrinya scripts (am/ti). Already the
  founder's choice in the brand file. Afaan Oromoo (Latin script) uses Poppins.
- Self-hosted `woff2`, subset, `font-display: swap`. Fluid type scale (e.g. `clamp()`),
  tight heading letter-spacing (`-0.01em`), generous line-height (1.6 body).
- Kicker/eyebrow style: 13px, `.14em` tracking, uppercase, `--teal`, 600 (from the brand file).

## 3. Iconography & imagery
- **Tabler Icons** (self-hosted subset) — the set used in the brand file.
- **Illustration-forward** where real photos aren't supplied; authentic Ethiopian
  photography (women entrepreneurs, small shops, families, youth, riders) swapped in as
  the founder provides it (F4). Avoid generic global stock.

## 4. The signature motion — "zradar" (the near-you motif)
Taken from the brand file's own animation (this is the hero's DNA):
- **Zone rings:** 3 concentric rings pulse outward from the pin — `scale(.12)→scale(1)`,
  `opacity 0→.55→0`, `3s` linear, staggered `+1s`/`+2s`. Reads as a live nearby-search.
- **Pin pulse:** the center dot gently breathes `scale(1)→1.06` (`3s ease-in-out`).
- Website hero extends this: rings react to cursor proximity; scroll-reveals and hover
  lifts elsewhere. **All GPU-friendly (transform/opacity), all disabled under
  `prefers-reduced-motion`, all smooth on low-end Android** (NFR-1/7).

## 5. Spacing, radius, shadow, motion scale (proposed, brand-consistent)
- **Radius:** `--r-sm 10px`, `--r-md 16px` (cards, from the brand file), `--r-pill 999px`,
  app-icon squircle `~22.5%`.
- **Spacing:** 4-based scale (4/8/12/16/24/32/48/64/96).
- **Shadow:** soft, low-elevation, warm-neutral (no harsh drop shadows).
- **Motion:** durations `120/250/400ms`; easing `cubic-bezier(.2,.7,.2,1)` (calm, premium).

## 6. Logo usage (assets in `brand/`)
- **App icon** (`AppIcon_*.png` / `Logo_AppIcon.svg`) — square/squircle; the pin + rings.
- **Horizontal** (`Logo_Horizontal.svg`) — header (light grounds), footer.
- **Wordmark** (`Logo_Wordmark.svg`) — compact/mono contexts; on-dark variant for the
  hero footer/nav-on-scroll.
- **Animated app icon** (`AppIcon_Animated.svg`) — optional micro-moment (favicon-scale
  restraint; not a distraction).
- Clear-space = the pin's corner radius; never recolor, stretch, or add effects; never
  place the light wordmark on a busy photo without the navy scrim.

## 7. Token delivery
`src/styles/tokens.css` exposes every token above as CSS custom properties, plus a
`[data-theme="dark"]` (navy-ground) surface map for dark sections/hero. A single JSON
mirror (`brand.tokens.json`) documents them for the README so a non-technical person (or
a future Flutter Web portal) can reuse the exact same values — one brand, everywhere.
