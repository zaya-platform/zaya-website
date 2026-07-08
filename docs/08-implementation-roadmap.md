# 08 · Implementation Roadmap (post-approval)

Nothing here is built until the plan is approved (F1–F6 resolved). Phases are sized to
give the founder **visual checkpoints early** and to keep the site shippable-honest at
every step. Each phase ends green on the Lighthouse budget (perf/a11y/SEO) and the
honesty checklist (H1–H6).

## Phase 0 — Foundation & brand (checkpoint: the look)
- Scaffold the `zaya-website` Astro project (separate repo), CI + preview deploys.
- Build the **design-token system** from the official assets (doc 06); self-host fonts
  (Poppins + Noto Sans Ethiopic) + Tabler subset; `tokens.css` + `brand.tokens.json`.
- Primitives (doc 04 §1) incl. **`StatusTag`** and `Logo`; a dev `/styleguide` catalogue.
- **Deliverable:** the brand system + a static hero composition for visual sign-off.

## Phase 1 — Homepage + the animated hero (checkpoint: the feel)
- `Header`/`MobileNavDrawer`, `Footer`, `BaseLayout` + `<SEO>`.
- **`NearYouHero`** ★ (the radar-pulse island; cursor-reactive; reduced-motion static).
- Homepage sections through Diaspora story + CTA (doc 04 §3), with draft copy (doc 07).
- **Deliverable:** a living homepage (English) for founder review of look, motion, voice.

## Phase 2 — The full public page set
- Solutions index + the **6 audience pages** (Today→With-ZAYA) · Pricing (config-driven) ·
  About · Contact (front-end form) · FAQ · Partners/Careers (placeholders) · Help/Blog
  (index + templates + a few seed guides) · Privacy/Terms scaffolding.
- **Deliverable:** every page in the sitemap (doc 02), honestly tagged, English complete.

## Phase 3 — Gateway + i18n front
- Gateway coming-soon pages (`/signin`, `/get-started`, role selection) → `app.zaya.et`.
- **`LanguageSelector`** + hero/nav/CTAs in all four languages (drafts flagged, F3);
  locale routing + `hreflang`.
- **Deliverable:** the navigational front door + the 4-language front.

## Phase 4 — Polish, SEO, a11y, performance
- `sitemap.xml` + `robots.txt` + OG images + structured data; full axe + keyboard pass;
  image/font optimization to budget; motion QA on low-end Android.
- **Deliverable:** green Lighthouse (perf/a11y/best-practices/SEO) + the honesty audit.

## Phase 5 — Deploy & handover
- Connect the domain (F2) + `app.zaya.et` placeholder; wire the form service (F5).
- **Deliverable #8 README:** how a non-technical person edits pricing/contact/nav/blog and
  **swaps in the official brand assets** (already tokenised).
- **Deliverable #9 Deployment doc:** domain + static host + form-service wiring + rollback.
- Swap founder-supplied real content (F4) as it arrives — no redesign needed.

## Deliverable #10 — Future portals note (how the front door connects)

When the Flutter Web portals (merchant / supermarket / admin) ship, they run **on the
existing `zaya-platform` backend** (its services behind the one API gateway, versioned
OpenAPI contracts) — **never a new backend**. This website's only change is to point the
gateway links (`site.config.portalUrl`, currently `app.zaya.et` "coming soon") at the
live portal. Because Sign In / Get Started / Role Selection already exist in the nav from
day one (Part 0 §3), **no redesign is needed** — the coming-soon target simply becomes the
real portal. The website and the portals stay separate deployables sharing only the
brand tokens (doc 06 §7), so the one-backend rule holds and the marketing site never
couples to product code.

## Risks & guards
- **Scope creep toward a portal** → any "let's just add login/dashboard here" is refused
  and redirected to a portal-on-the-backend (flagged, not absorbed).
- **Unverified copy shipping** → the draft-flag + honesty checklist gate every phase.
- **Palette churn (F1)** → tokens make it a one-file swap; we build once F1 is confirmed.
- **Perf regressions from motion/images** → the Lighthouse budget is a CI gate.

## Definition of done (whole site)
Every sitemap page live; honest live-vs-roadmap throughout; 4-language front working;
gateway links to the coming-soon portal; green performance/a11y/SEO; README + deployment
doc complete; official brand assets swapped in; **no backend, no auth, no payments** —
and the pilot was never delayed.
