# 07 · Content & Localization Plan

Voice: **warm, plain, proud, problem-first.** Lead with people and outcomes (shopkeepers,
customers, families), not features or tech (H6). Every not-live claim carries a
`StatusTag` (H1). Diaspora = provisioning, never remittance (H4). No transport product
named (H5). No unsubstantiated claims (H2). Copy below is **draft direction** for founder
review — final English is the founder's to approve; am/om/ti are drafted then verified (F3).

## 1. Homepage narrative (section-by-section intent)

| Section | Job | Draft direction |
|---|---|---|
| **Hero** | Instant "what & for whom" + the feeling | Tagline **"Everything near you."** · sub: "The shops, goods, and services around you — and the tools that help your business grow." · animated near-you rings · CTAs: *Join the pilot* / *Sign in [coming soon]* |
| **Problems We Solve** | Recognition | Paper notebooks and forgotten credit. Not knowing which nearby shop has it, at a fair price. Queues and hours of hand-reconciliation. Families abroad sending money into the dark. |
| **Who We Serve** | Route each visitor | 6 audience cards, one pain→solution line each → deep pages |
| **How ZAYA Helps** | The mechanism, simply | One phone for the whole shop; find & compare nearby; delivered by someone local; proof, not guesswork |
| **Platform Overview** | The shape of it (honest) | One trusted platform, many front doors — sell, buy, deliver, provide for family. Tag what's Live vs Launching vs Roadmap |
| **Merchant / Customer / Supermarket stories** | Concrete outcomes | short narrative each (below) |
| **Diaspora story ★** | Strategic headline | prominent block (below), *On the roadmap* |
| **Future Vision** | Ambition, tagged | The broader ecosystem, honestly *Future* — no promises presented as today |
| **Testimonials / Partners** | Trust | **Placeholder** blocks until the founder supplies real ones (H3) |
| **FAQ → CTA → Footer** | Resolve + convert | "Join the pilot" · real contact details |

## 2. Audience pages — Today → With ZAYA (Part 6)

**Shop owner**
- *Today:* a paper notebook, credit you half-remember, stock you discover is gone.
- *With ZAYA:* sales, stock, and your **credit book** in one phone; **a sale in ~5
  seconds** (tap, or scan a barcode); a plain-language summary of your day. *(Live in the pilot.)*

**Customer**
- *Today:* which nearby shop has it, at a fair price? You walk and guess.
- *With ZAYA:* search shops & services near you, **compare prices**, pick the best shop,
  order in a tap, pay cash or digital, and have it **delivered by someone local** —
  anchored to your saved place (Home/Work). *(App Launching.)*

**Supermarket**
- *Today:* many cashiers, queues, hours reconciling by hand.
- *With ZAYA:* multi-cashier operations, scan-and-go, **one live dashboard** — and a
  future **web business workspace** for the big screen. *(Dashboard Live/Launching; web
  workspace On the roadmap.)*

**Delivery partner**
- *Today:* finding steady work and good routes is hard.
- *With ZAYA:* easy registration, job opportunities near you, navigation, and clear
  performance tracking. *(On the roadmap.)*

**Diaspora ★ (dedicated, prominent)**
- *Headline:* **"Provide for your family — real goods, not cash into the dark."**
- *Body:* Order groceries and essentials from a **trusted shop in their neighbourhood**.
  **Shelf prices + one transparent fee** — no 20–50% gift-shop markup. **Confirmed
  delivery with a photo.** Optional **monthly family basket.**
- *4 steps:* 1) Choose their trusted shop · 2) Order essentials at shelf prices + one fee
  · 3) The shop fulfils, delivered locally · 4) You get proof — a delivery photo.
- *Tag:* **On the roadmap.** *(Never "send money"; ZAYA is not a money-transfer service — H4.)*

**Suppliers** — *Future:* upstream collaboration for shops to restock better. One honest
teaser, tagged *Future*.

## 3. Supporting content
- **"Learn ZAYA in minutes"** guide cards: sign in with your phone · add products & stock
  · record your first sale · manage the credit book → placeholder guide pages.
- **"Manage your stock from the web"** teaser: fill your catalogue on a big-screen web
  workspace that **syncs to the ZAYA phone app** — one shop, kept in sync. *(Roadmap
  teaser only; the tool is not built here.)*
- **Pricing** copy: FREE (0 ETB, forever) · STARTER 199 · PRO 299 · PREMIUM MAX (from 999
  + per-branch). "Save with 6-month (~5%) and annual (~10%) plans." "Customers use ZAYA
  free." "No hidden fees." (All from `pricing.config`.)
- **Contact:** real email + two phones; a warm, prominent **"Join the pilot"** ask.
- **Legal (Privacy/Terms):** founder/legal-supplied; placeholder scaffolding until then.

## 4. Localization plan (am · om · ti · en)

> **DEFERRED (founder ruling 2026-07-08).** The draft am/om/ti translations weren't
> good enough, so the **language selector is removed and the website ships English-only
> for now**; proper, native-speaker-verified localization returns in a **later phase**.
> The i18n structure (routing, `site.locales`, message files) is kept ready so it
> re-enables cleanly. (The ZAYA *app* still supports all four languages — this is the
> marketing website only.) The phased table below applies **when localization resumes**.

| Phase | Scope | Notes |
|---|---|---|
| **Launch** | **English complete.** Hero, nav, primary CTAs, language names, and key labels in **all four** languages. | am/ti in Noto Sans Ethiopic; om in Latin (Poppins). |
| **Phase 2** | Full body localization of Home + the 6 audience pages | Content collections per locale |
| **Phase 3** | Remaining pages (help, blog, legal) | As content matures |

**Verification (F3):** every am/om/ti string is drafted, marked `_draft`, and shown only
after a **native-speaker, founder-approved** check. Until then the UI may show a subtle
"translation in review" note rather than present an unverified string as final. English
copy is the founder's to approve before launch.

## 4a. The ZAYA persona (founder direction, 2026-07-08) — governs imagery + copy

**ZAYA's user is a smartphone-enabled, more-educated, digitally-capable SHOP and
SUPERMARKET owner** — the retailer ready to go digital, not the informal open-air
street/market trader. Imagery and copy must reflect this: **lead with established
shops, mini-markets, and supermarkets** (and their owners), not street-produce vendors.
Balance authenticity with aspiration. The core pain to dramatise: **the busy shop owner
juggling stock and struggling to keep the credit list and amounts straight.**

## 4b. Imagery & photography (founder direction, 2026-07-08)

**Hero = an authentic Ethiopian human scene, brand motion second.** The homepage hero is
the approved photo **#7 (two women + a baby at a neighbourhood kiosk)** — human warmth
first — with the brand's **"near-you" radar motif layered *softly* over the scene** (low
opacity, gentle pulse, cursor-reactive), not an abstract tech animation. Pain-point-first
page organisation is unchanged.

**Approved authentic-Ethiopian images** (content-identified from the founder's "Selected
Photos" folder; copied to `src/assets/photos/`):
- **#7** women + baby at a kiosk — **preferred hero**.
- **#1** market woman at her fruit stall — "real shops" band.
- **#6** man in an Ethiopian supermarket — "real shops" band / supermarket sections.

**Excluded (do NOT use):** the delivery-rider photo (shows competitor **"ተኩስ/Tikus"**
branding); the **two West-African-attire** shots (not authentically Ethiopian); the
**phone-screen/app** image (a technology image + possible competitor app).

**⚑ BINDING rights gate:** **no supplied photo enters a PUBLISH build until its commercial
usage rights are confirmed.** Until then every photo renders as a clearly-marked
placeholder (**"Photo · rights pending"**). **Prefer original/commissioned photography of
the real Haile Garment pilot shops** when available. Enforced in code: `RIGHTS.md` +
`site.published` + `scripts/check-publish.mjs` (which refuses a publish build while any
used image is still rights-pending).

## 5. Content the founder needs to supply (queue — F4)
Real photography · testimonials · partner logos · final brand-story text · blog/news
posts · careers roles · Privacy & Terms legal copy · verified am/om/ti translations ·
form-service account (F5) · domain (F2) · palette confirmation (F1). The site ships
**honestly without them** (placeholders tagged) and swaps them in with **no redesign**.
