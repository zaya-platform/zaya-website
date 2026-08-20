# ZAYA Digital Front Door — Website

> **STATUS: Phase 0 (foundation) + Phase 1 (homepage) in build** — founder-approved
> 2026-07-08 (rulings F1–F6 + the CMS addendum in [docs/09](docs/09-founder-rulings-and-cms.md)).
> The homepage look/motion/voice is out for visual sign-off (a self-contained preview).
> Per the gate: the **full page set is not built until Phase 1 is approved.**
> The planning docs (WRS, IA, flows, components, architecture, roadmap) live in `docs/`.

## Editing content (no developer, no code) — deliverable #8

All website content is **CMS-editable** (Decap, at `/admin`) or lives in plain config
files — never hardcoded. A non-technical ZAYA admin can update:

| To change… | Edit (via CMS **or** file) |
|---|---|
| Prices / tiers / discounts | **Pricing** collection → `src/content/data/pricing.json` (mirrors `src/config/pricing.ts`) |
| Contact email / phones | **Contact** collection → `src/content/data/contact.json` (mirrors `src/config/contact.ts`) |
| Homepage / page copy | **Pages** collection → `src/content/pages/*` |
| Blog / news | **Blog** collection → `src/content/blog/*` |
| Testimonials / partners | **Testimonials / Partners** collections (kept `placeholder: true` until real — F4) |
| Careers | **Careers** collection |
| Images | CMS media library → `src/assets/uploads/` |

**Swapping in the official brand** — the whole look is driven by `src/styles/tokens.css`
(colors/type, extracted from `brand/`). Replace a token value there and every page
updates; drop real Poppins + Noto Sans Ethiopic `woff2` into `src/assets/fonts/`.

**Publishing is gated (F4), in both directions:** `npm run build` refuses a production
build until `site.published = true` **and** real Privacy + Terms exist, photo rights are
cleared, and the assistant's state checks out (see `scripts/check-publish.mjs`).
`npm run build:draft` builds the internal, `noindex` preview — and refuses to run when
`site.published = true` (see `scripts/check-draft.mjs`), so the draft path can never be
used to emit an indexable site. The two are exhaustive over the flag, which is what makes
it impossible to publish/index the site before real legal + content exist.
`/robots.txt` is generated from the same flag (`src/pages/robots.txt.ts`), so there is
one switch, not two.

**The AI assistant is gated separately (2026-08-20 founder ruling):** its own
`src/config/assistant.json` + `ZAYA_ASSISTANT` / `ZAYA_ASSISTANT_TOKEN` env pair —
publishing the site does not expose it and previewing it does not publish the site.
It ships OFF (no markup at all), and `/api/assistant` refuses every call that does not
carry the shared secret. Design, limits and the founder's preview recipe:
**`docs/ASSISTANT-GATE.md`**.

Deployment (domain `zaya.app` + `app.zaya.app`, static host, form-service wiring) is
documented in `docs/` and finalized at deploy (deliverable #9).

The **ZAYA Digital Front Door** is the public marketing website and navigational
gateway to the ZAYA platform. It is a **standalone project in its own repository**
(`zaya-website`) — deliberately **separate from the `zaya-platform` app monorepo**
so the two never share a lifecycle and the product code is never at risk. This site
has **no backend, no database, no auth, no payments, no business logic**: ZAYA already
has one backend (the platform's TypeScript services behind one API gateway), and every
future web portal will be a Flutter Web client on **that** backend — never a new one.

## What's here

| Doc | Purpose |
|---|---|
| [docs/00-executive-summary.md](docs/00-executive-summary.md) | The plan at a glance · key decisions · **founder decisions / flags to resolve** |
| [docs/01-WRS.md](docs/01-WRS.md) | Website Requirements Specification — scope, non-goals, binding rules, functional + non-functional requirements, success criteria |
| [docs/02-IA-and-sitemap.md](docs/02-IA-and-sitemap.md) | Information Architecture · sitemap · navigation model · URL scheme · live-vs-roadmap tagging |
| [docs/03-user-flows.md](docs/03-user-flows.md) | Key visitor journeys (per audience + the gateway "coming-soon" flows) |
| [docs/04-component-hierarchy.md](docs/04-component-hierarchy.md) | Design-system + component library structure (atoms → sections → pages) |
| [docs/05-technical-architecture.md](docs/05-technical-architecture.md) | Stack, project structure, i18n, forms, portal-linking, SEO/perf/a11y, deployment |
| [docs/06-brand-and-design-tokens.md](docs/06-brand-and-design-tokens.md) | The **official** brand system extracted from the supplied assets + design tokens + the placeholder-vs-official discrepancy flag |
| [docs/07-content-and-localization-plan.md](docs/07-content-and-localization-plan.md) | Homepage narrative, per-audience pain→solution copy strategy, honesty tags, 4-language plan |
| [docs/08-implementation-roadmap.md](docs/08-implementation-roadmap.md) | Phased build roadmap (post-approval) with milestones + acceptance |

## Official brand assets (single source of truth)

`brand/` holds the founder-supplied logo system (2026-07-07): app icon, horizontal
logo, wordmark, animated app icon, and the interactive brand reference. The design
tokens in doc 06 are extracted **directly** from these files — nothing is invented.

## The one rule that governs everything

**One backend, many front doors. Honest about live-vs-roadmap. Supports the pilot,
never delays it.** Every decision in these docs is checked against it.
