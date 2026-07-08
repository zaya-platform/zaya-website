# 00 · Executive Summary — ZAYA Digital Front Door

**Date:** 2026-07-07 · **Status: PROPOSED — for founder approval before any production code.**

## 1. What this is (and isn't)

The **ZAYA Digital Front Door** is the public marketing website and navigational
gateway to the platform: a fast, warm, proudly-Ethiopian site that tells a visitor
what ZAYA is, who it serves, the problems it solves, and how to join — and carries the
future entry points (Sign In · Get Started · role selection) from day one so it never
needs redesigning. It is **not** a landing page, **not** the app, **not** a backend.

**It creates no backend, database, auth, payments, or business logic.** ZAYA already
has one backend; every future web portal will be a Flutter Web client on *that*
backend. This site is a **standalone project in its own repo** (`zaya-website`),
separate from `zaya-platform`, deployable to a free static host. Anything not yet live
is shown as **"Launching" / "On the roadmap" / "Pilot access — coming soon"** — never
presented as available today.

## 2. The plan in one paragraph

An **Astro** static-first site (recommended in the prompt) with a small **design-token
system** built from the founder's **official** logo assets, a component library, and a
signature **animated "near-you" hero** that reuses the brand's own radar-pulse motif.
Public pages (Home, About, Solutions ×6 audiences, Pricing, Partners, Careers, News,
Help, FAQ, Contact, Privacy, Terms) plus gateway "coming-soon" pages (Sign In, Get
Started, Role Selection → future `app.` subdomain). A **4-language** front (am · om ·
ti · en) with the hero, nav, and CTAs switching live; full localization phased. Forms
are front-end only (wire a form service at deploy). Pricing lives in one config file.
Honest about live-vs-roadmap throughout.

## 3. Key decisions (recommended — confirm or redirect)

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Framework | **Astro** (static-first, islands for the interactive hero) | Best-in-class perf/SEO for a content site; ships zero JS by default; trivial i18n routing; the prompt's first recommendation |
| D2 | Repo | **New `zaya-website` repo**, separate from `zaya-platform` | Part 0 rule — different lifecycle, never risk product code |
| D3 | Host | **Netlify or Vercel free tier** (static) + CI preview deploys | Zero-cost, fast global CDN, form-service integration |
| D4 | Brand | Build on the **official supplied assets** (teal/coral/navy) as the single source of truth via design tokens | Part 2 — the supplied logo overrides the placeholder direction (see ⚑F1) |
| D5 | i18n | 4 locales; **EN complete + hero/nav/CTAs in all four at launch**, full body localization phased | Honest, shippable; translations founder-verified before they go live (⚑F3) |
| D6 | Portals | Sign In / role links → **`app.zaya.et` "pilot access — coming soon"** placeholder | Part 0 — no auth/portal built here |
| D7 | Forms | Front-end only; **Formspree** (or Netlify Forms) wired at deploy | Part 10 — no backend on this site |
| D8 | Pricing | One editable **`pricing.config`** file: FREE · STARTER 199 · PRO 299 · PREMIUM MAX 999+ | Part 8 — founder-signed tiers, easy to update |
| D9 | Icons/Type | **Tabler icons + Poppins + Noto Sans Ethiopic** (the founder already used these in the brand file) | Consistency with the supplied brand system |

## 4. ⚑ Founder decisions / flags to resolve (flagged, not absorbed)

| # | Flag | Detail | Recommendation |
|---|---|---|---|
| **F1** | **Brand palette discrepancy** | The prompt's Part 2 *placeholder* text says "forest-green ground, emerald primary, gold accent." The **supplied official assets** are **teal `#0EA5A4` + coral `#FF7A45` + deep navy `#1E2A4A`** (+ amber/plum accents). These disagree. | Per Part 2 ("supplied assets = single source of truth"), **build on the official teal/coral/navy**. Please **confirm** — or supply the green/gold guideline if that is the intended final palette. Tokens make either a one-file swap. |
| **F2** | **Domain** | The plan assumes `zaya.et` (site) + `app.zaya.et` (future portal). | Confirm the domain(s) you own / intend (`.et`, `.com`, both). Affects canonical URLs, OG tags, sitemap, portal-link targets. |
| **F3** | **Verified translations** | am/om/ti copy will be drafted and **clearly flagged as draft** in code until a native speaker verifies. | Confirm who verifies each language and which pages are fully localized at launch vs. phased. |
| **F4** | **Founder-supplied content** | Real Ethiopian **photography**, **testimonials**, **partner logos**, **brand-story text**, **blog/news**, **careers roles**, and **Privacy/Terms legal copy** are not yet available. | These render as clearly-marked **placeholders** until supplied. Please queue them; the site ships honestly without them and swaps them in with no redesign. |
| **F5** | **Contact form service** | The message / "Join the pilot" form is front-end only until wired. | Approve a **Formspree** (or Netlify Forms) account at deploy; until then the form shows the real email/phone as the working channel. |
| **F6** | **Diaspora + transport wording** | Diaspora is framed **"provide for family — real goods, delivered, with proof,"** never "send money"; no transport/ride product is named (legal/trademark gate). | Confirm this honesty framing holds; flag any wording you want changed. |

## 5. What this protects

- **The pilot** — this is public marketing + a navigational shell only; it builds no
  portals, dashboards, registration, KYC, or payments, so it cannot delay the pilot.
- **The one backend** — nothing here duplicates any platform service; the gateway links
  point at a future subdomain, not a new system.
- **Honesty** — every roadmap item is tagged; no unsubstantiated security/scale claims;
  no fake testimonials/partners; diaspora framed as provisioning, not remittance.

## 6. Ask

Approve the plan (or redirect on F1–F6), and I'll proceed to the phased build in
[08-implementation-roadmap.md](08-implementation-roadmap.md) — scaffolding the `zaya-website`
project, the design-token system from the official assets, and Phase 1 (the homepage +
brand system + the animated hero) first, for a visual review before the full page set.
