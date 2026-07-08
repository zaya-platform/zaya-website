# 11 · Production build & admin management

The approved **Website V2** homepage is now a real Astro app in this repo. It builds to
static HTML/CSS/JS + optimized images — no backend, no database (one backend, many front doors).

## Run it
```bash
npm install
npm run dev         # local dev at http://localhost:4321
npm run build:draft # build without the publish gate (for review)
npm run preview     # serve the built site
npm run build       # PRODUCTION build — runs the F4 publish gate first
```
- Page: `src/pages/index.astro` (the V2 homepage).
- Layout/head: `src/layouts/Base.astro` · styles: `src/styles/tokens.css` (brand SSOT) + `src/styles/site.css`.
- Interactions (ecosystem canvas, lightbox, scroll-reveal): `src/scripts/site.js`.
- Photos: `src/assets/photos/*.jpg` (imported → Astro optimizes them at build).

## Admin staff can manage the website — no code (Decap CMS)
Content lives **in this repo** as JSON/markdown; the components read it, so an edit updates
the site on the next build. Admin panel is served at **`/admin`** (`public/admin/`).

**What staff can edit** (`public/admin/config.yml`):
| Section | Editable | File |
|---|---|---|
| Pricing | tiers, prices, features, discounts note | `src/content/data/pricing.json` |
| Contact | email, phones, WhatsApp, location, Maps | `src/content/data/contact.json` |
| FAQ | questions & answers | `src/content/data/faq.json` |
| Blog / News | posts (draft → publish) | `src/content/blog/` |
| Testimonials | with an explicit *placeholder* flag (F4 — never fake) | `src/content/testimonials/` |
| Partners | with a *placeholder* flag (F4) | `src/content/partners/` |
| Careers | job posts | `src/content/careers/` |

Homepage copy (hero, section headings) is also externalised in `src/content/data/*.json`
(`site.json`, `home.json`) and can be added to the CMS as needed.

**How the login works (finalised at deploy):** editors sign in with a **separate
website-editing account — entirely distinct from ZAYA platform user auth**. On Netlify:
enable **Identity** + **Git Gateway**, then invite each admin by email. They visit `/admin`,
edit through a friendly draft → review → publish workflow, and their changes commit to git →
the site rebuilds and deploys. (No new database; the repo is the store.)

## Go-live checklist (before flipping `published: true`)
The F4 honesty gate keeps the site **noindex** and blocks a production build until these are done:
1. **Legal** — add real Privacy Policy + Terms (the gate refuses to publish without them).
2. **Admin login** — enable Netlify Identity + Git Gateway; invite admin staff.
3. **Form** — set `contact.formEndpoint` (Formspree/Netlify Forms) so the pilot form submits.
4. **Fonts** — self-host Poppins + Noto Sans Ethiopic as woff2 (currently a system-stack fallback).
5. **Photos** — the current shots are the founder's AI persona set; swap in commissioned
   pilot-shop photography when available (drop-in, same filenames).
6. **Sitemap** — re-enable `@astrojs/sitemap` in `astro.config.mjs` (bump the plugin first).
7. Flip **`src/content/data/site.json → published: true`** — this lifts noindex and lets
   `npm run build` pass the gate.

## Not built here (by design — one backend, many front doors)
Sign-in / role links point to `app.zaya.app` (coming soon). No auth, payments, or business
logic live in the website — those belong to the ZAYA platform backend.
