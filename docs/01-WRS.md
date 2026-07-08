# 01 · Website Requirements Specification (WRS)

**Version:** 1.0 (proposed) · **Product:** ZAYA Digital Front Door (public website + gateway)

## 1. Purpose & scope

A public marketing website and navigational gateway for the ZAYA platform. It informs,
persuades, and routes visitors toward joining the pilot and (later) the portals. It is
content + presentation + client-side interactivity only.

### 1.1 In scope
- All public pages (§4.1) and gateway "coming-soon" pages (§4.2).
- A brand design-token system + reusable component library.
- A signature animated "near-you" hero and tasteful motion throughout.
- A 4-language front (am/om/ti/en) with live switching of hero, nav, and CTAs.
- Front-end-only contact / "Join the pilot" form (wired to a form service at deploy).
- SEO (meta/OG, `sitemap.xml`, `robots.txt`), accessibility, performance.
- Config-driven pricing and content that a non-technical person can update.

### 1.2 Out of scope (hard non-goals — Part 0 / MVP protection)
- **No backend, database, server, or API of its own.** No business logic.
- **No authentication, accounts, registration, KYC, or session** on this site.
- **No payments/billing.** No portal, dashboard, or catalogue/stock tool (teasers only).
- **No duplication** of any `zaya-platform` service, contract, or data.
- **No transport/ride product** named or announced (legal/trademark gate).
- Anything above appears only as **marketing teasers** tagged roadmap, or as
  **gateway links** to a future subdomain that shows "coming soon."

## 2. Binding rules (from the brief — non-negotiable)

**Architecture (Part 0):** one backend, many front doors · standalone separate repo ·
future-ready navigation but not future features · MVP protection.

**Honesty & governance (Part 1):**
- H1 — Label **LIVE vs ROADMAP** everywhere; nothing unavailable is shown as available.
- H2 — **No unsubstantiated claims** (no "bank-level security," no unverified scale/security claims).
- H3 — **No fake testimonials or partner logos**; clearly-marked placeholders until the founder supplies real ones.
- H4 — **Diaspora framing = "provide for family / order real goods, delivered, with proof"** — never "send money."
- H5 — **No transport/ride product** named; at most a generic "Mobility & Logistics — Future."
- H6 — **Problem-first, benefit-first** copy; technology stays in the background.

## 3. Users & goals

| Audience | Primary goal on the site |
|---|---|
| Shop owner (merchant) | Understand how ZAYA replaces the paper notebook + credit book; join the pilot |
| Supermarket / enterprise | See multi-cashier operations + the future web workspace; enquire |
| Customer | Understand "find & order from shops near me, fair prices, delivered" |
| Delivery partner | Understand the opportunity; register interest |
| Diaspora | Understand "provide real goods for family, with proof — not cash into the dark" |
| Supplier (future) | Learn about future upstream collaboration |
| Investor / partner / press | Grasp the vision, traction framing (honest), and contact |
| Job seeker | See the mission and open roles (placeholder until supplied) |

## 4. Functional requirements

### 4.1 Public pages
`Home` · `About / Our Story` · `Solutions` (index + `Merchants`, `Supermarkets`,
`Customers`, `Delivery Partners`, `Diaspora`, and a future `Suppliers` note) · `Pricing`
· `Partners` · `Careers` · `News & Blog` (index + post template) · `Help Center` ·
`FAQ` · `Contact` · `Privacy Policy` · `Terms of Service`.

### 4.2 Gateway pages (navigation entry points, "coming-soon")
`Sign In` · `Get Started` · `Role Selection` (Merchant · Supermarket · Customer ·
Delivery Partner · Diaspora · Administrator). Each links to the future portal subdomain
(`app.zaya.et`) which shows a **"Pilot access — coming soon"** page. **No auth is built.**

### 4.3 Homepage narrative (Part 5)
Hero → Problems We Solve → Who We Serve (per-audience pain→solution) → How ZAYA Helps →
Platform Overview → Merchant story → Customer story → Supermarket story → **Diaspora
story (prominent)** → Future Vision (honestly tagged) → Testimonials (placeholder) →
Partners (placeholder) → FAQ → Call to Action → Footer.

### 4.4 Required features
- **FR-1 Language selector** (nav): am (አማርኛ) · om (Afaan Oromoo) · ti (ትግርኛ) · en, each
  in its own script; switches at least the hero + primary CTAs live; translations
  **founder-verified**, drafts flagged in code.
- **FR-2 Animated "near-you" hero** reusing the brand's radar-pulse motif; reacts to
  cursor; respects `prefers-reduced-motion`; smooth on low-end Android.
- **FR-3 "Manage your stock from the web" teaser** — marketing only, tagged roadmap; no tool built.
- **FR-4 Resources / "Learn ZAYA in minutes"** guide cards linking to placeholder guide pages.
- **FR-5 Pricing** from one editable config: FREE (0) · STARTER 199 · PRO 299 · PREMIUM
  MAX 999+; note 6-month (~5% off) and annual (~10% off); customers free; no hidden fees.
- **FR-6 Contact + footer** with real details (email `zayaapp@gmail.com`, phones
  `+251 91 283 5922`, `+251 96 519 6475`) + prominent **"Join the pilot"** CTA + a
  front-end message form (wired at deploy).
- **FR-7 Per-audience Today→With-ZAYA** blocks (Part 6) with light illustration/icon.
- **FR-8 Live/roadmap tagging** component used consistently on every not-yet-live item.

## 5. Non-functional requirements

- **NFR-1 Performance:** static-first; Core Web Vitals green on 3G / low-end Android
  (target LCP < 2.5 s, CLS < 0.1, INP < 200 ms); optimized responsive images; minimal JS.
- **NFR-2 Accessibility:** WCAG 2.1 AA — semantic HTML, keyboard nav, visible focus,
  contrast, alt text, reduced-motion honored, screen-reader-sane language switching.
- **NFR-3 Responsive:** mobile-first → tablet → laptop → desktop → ultra-wide; consistent.
- **NFR-4 SEO:** per-page meta + Open Graph/Twitter cards, canonical URLs, `sitemap.xml`,
  `robots.txt`, structured data (Organization), `hreflang` for locales.
- **NFR-5 i18n-ready:** all copy externalized; locale routing; RTL not required (all 4 are LTR).
- **NFR-6 Maintainability:** design tokens; component library; content + pricing in
  config/content files a non-technical person edits (documented in the README).
- **NFR-7 Motion budget:** GPU-friendly transforms/opacity only; no layout thrash;
  reduced-motion disables non-essential animation.
- **NFR-8 Zero secrets / zero backend:** nothing on this site holds credentials or calls
  a private API; the only network calls are the form service and public font/asset CDNs
  (or self-hosted fonts for perf/privacy — see architecture doc).

## 6. Success criteria (from the brief)

A visitor leaves understanding **what ZAYA is, why it exists, who it serves, the
problems it solves, how to join, and that it will grow into a broader platform** — with
the impression that ZAYA is *the trusted digital front door to Ethiopia's commerce
ecosystem.* And measurably: **one backend, honest about live-vs-roadmap, fast and
accessible, and it supports the pilot rather than delaying it.**

## 7. Acceptance (per page)
Each page is "done" when it: renders correctly mobile→ultra-wide; passes the a11y checks
(§NFR-2); has meta/OG + correct `hreflang`; tags every not-live item (H1); contains no
unsubstantiated claim (H2) or unmarked placeholder (H3); and its copy is problem/benefit
-first (H6). The gateway pages additionally must build **no** auth and link only to the
coming-soon subdomain (Part 0).
