# 05 · Technical Architecture

## 1. Principles
- **Static-first, zero backend.** The site compiles to static HTML/CSS/JS; the only
  runtime network calls are the form service and (self-hosted) fonts/assets. No API of
  its own, no secrets, no auth (Part 0).
- **Islands of interactivity.** Ship ~zero JS by default; hydrate only the hero,
  language selector, mobile nav, and pricing toggle.
- **Tokens over hard-coding.** One brand-token layer; content + pricing in config.
- **Separate lifecycle.** Its own repo, its own CI/CD, its own host — never coupled to
  `zaya-platform`.

## 2. Stack (recommended)
| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Astro** | Static-first, content-collections, first-class i18n routing, island architecture, superb Core Web Vitals; the brief's first recommendation. (Next.js static export is an acceptable alternative.) |
| Styling | **Design tokens (CSS custom properties)** + a light utility layer (Tailwind optional, configured from the tokens) | One-file brand swap; small CSS; no runtime cost |
| Interactivity | Minimal vanilla JS or **Preact islands** | Hero, language, mobile nav, pricing toggle only |
| Content | **Astro content collections** (Markdown/MDX) for blog, help, FAQ, careers, audience body | Non-technical editing; typed frontmatter |
| i18n | **Astro i18n routing** + per-locale message JSON | Prefix-per-locale, `hreflang`, phased localization |
| Icons | **Tabler** (self-hosted subset) | Matches the supplied brand file |
| Fonts | **Poppins + Noto Sans Ethiopic**, self-hosted `woff2`, `font-display: swap`, subset | Perf + privacy (no third-party font CDN); Ethiopic script support |
| Forms | **Formspree** or **Netlify Forms** (front-end POST) | No backend; wired at deploy |
| Host | **Netlify** or **Vercel** free tier, static + preview deploys | Zero cost, global CDN, form integration |
| Analytics (opt) | Privacy-friendly (Plausible/Umami) — **founder decision**, off by default | Honest, cookieless; not built until approved |

## 3. Project structure (proposed)
```
zaya-website/
├── src/
│   ├── components/    primitives · molecules · sections   (doc 04)
│   ├── layouts/       BaseLayout, page templates
│   ├── pages/         file-based routes (+ /[locale]/ variants)
│   ├── content/       blog/ help/ faq/ careers/ audiences/  (Markdown/MDX)
│   ├── i18n/          en.json am.json om.json ti.json  (+ draft flags)
│   ├── config/        site.config · pricing.config · contact.config · nav.config
│   ├── styles/        tokens.css · typography.css · motion.css · base.css
│   └── assets/        brand/ (official logo set) · illustrations/ · images/
├── public/            robots.txt · sitemap (generated) · favicons · og-images
├── docs/              THIS planning set (kept in-repo)
└── README.md          how to edit content/pricing + swap brand assets + deploy
```

## 4. Internationalization
- 4 locales: `en` (default, unprefixed) · `am` · `om` · `ti` under `/am`,`/om`,`/ti`.
- Shared UI strings + hero/CTA in `src/i18n/<locale>.json`; long-form body via localized
  content collections, phased.
- **Draft discipline:** any unverified translation is marked (`"_draft": true` +
  a code comment) and, until founder-verified, the UI may show a subtle "translation in
  review" note per F3 — never a silently-wrong claim.
- `hreflang` + `x-default` emitted for every page; language choice persisted.

## 5. Forms (front-end only)
- A single `ContactForm` island POSTs to the configured form-service endpoint
  (`contact.config.formEndpoint`). No data touches this site's (non-existent) backend.
- **Until wired:** the form renders but its submit shows the real email/phones as the
  working channel (honest, no fake success). Documented for deploy.
- Basic client validation + honeypot spam field; no PII stored client-side.

## 6. Portal / gateway linking (the "front door")
- Gateway routes (`/signin`, `/get-started/*`) render a **coming-soon** page and link to
  `app.zaya.et` (config: `site.config.portalUrl`), which itself is a placeholder for now.
- **No auth, token, or session code exists on this site.** When the Flutter Web portals
  ship on the existing backend, only the `portalUrl` target changes — no redesign
  (deliverable #10; see doc 08 §Future portals).

## 7. SEO
- `<SEO>` component per page: title, meta description, canonical, OG/Twitter card,
  `hreflang`, JSON-LD `Organization`. `sitemap.xml` auto-generated (all locales);
  hand-authored `robots.txt`. Pre-rendered HTML = fully crawlable.

## 8. Performance
- Static HTML; critical CSS inlined; non-critical deferred. Images: responsive
  `srcset`/`sizes`, modern formats (AVIF/WebP), lazy below the fold, explicit dimensions
  (CLS). JS only on islands, code-split. Fonts subset + preload the hero face.
- Budget: JS < ~40 KB on the homepage island path; LCP < 2.5 s on emulated 3G/low-end.

## 9. Accessibility
- Semantic landmarks, one `<h1>`/page, logical heading order, skip-link, visible focus,
  AA contrast (tokens chosen to pass — see doc 06), `alt` on all imagery, accessible
  disclosures (FAQ), reduced-motion honored, screen-reader-correct language switching
  (`lang` attribute per locale). Audited with axe + manual keyboard pass.

## 10. Security & privacy (honest, minimal)
- No backend, no accounts, no cookies beyond a language-preference cookie (+ optional,
  approved, cookieless analytics). No third-party trackers by default. CSP headers via
  host config. **No security claims** on the site (H2). A short, truthful Privacy Policy
  (founder/legal-supplied) explains the form service + any analytics.

## 11. CI/CD & deployment
- GitHub repo `zaya-website`; on PR → preview deploy; on merge to `main` → production.
- Static build, Lighthouse CI budget check (perf/a11y/SEO) as a gate.
- Domain: `zaya.et` (F2) + `app.zaya.et` for the portal placeholder. TLS via host.
- Rollback = redeploy a prior build (immutable static artifacts).

## 12. What this architecture deliberately does NOT include
No server, DB, ORM, auth provider, payment SDK, portal, dashboard, catalogue/stock tool,
or any `zaya-platform` dependency. If a future need looks like it wants one of these, it
is a **portal** on the existing backend, not something added to this site — flagged, not
absorbed.
