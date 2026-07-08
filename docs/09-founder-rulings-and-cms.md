# 09 · Founder Rulings (2026-07-08) + Admin CMS Architecture

## 1. Rulings on F1–F6 (folded — these now govern the build)

| Flag | Ruling |
|---|---|
| **F1 Palette** | **Official teal/coral/navy** — `#0EA5A4` / `#FF7A45` / `#1E2A4A` — single source of truth. Green/gold placeholder **superseded**. Reuse the brand's **"near-you" radar-pulse** for the animated hero. |
| **F2 Domain** | **`zaya.app`** (site) · **`app.zaya.app`** (portal subdomain). Canonical URLs, OG tags, `sitemap.xml`, and all Sign-In / role links target these. |
| **F3 Translations** | Founder verifies **Amharic**; a checker to be found for **Afaan Oromoo** + **Tigrinya**. **Fully localize HOME + PRICING + CONTACT at launch**; phase the rest. Draft am/om/ti **clearly flagged unverified** until confirmed. |
| **F4 Content** | Placeholders are fine to **build** with. **BINDING publish carve-out:** the site must **NOT be published / indexed / promoted publicly** without **real Privacy Policy + Terms** (personal data is collected; Ethiopian data-protection law) and **no fake testimonials or partner logos**. Build now; publish only after real legal + real content. |
| **F5 Forms** | **Formspree** (or Netlify Forms) wired at deploy; add a **short privacy line** on the form (it collects names/phones). Until wired, show the real email/phones as the working channel. |
| **F6 Wording** | Confirmed — diaspora = *"provide for family — real goods, delivered, with proof,"* never "send money"; **no transport/ride product named.** |

### Build gates that follow from the rulings
- **`robots.txt` ships `Disallow: /` + `<meta name="robots" content="noindex">`** until the founder flips the "publish" switch (one config flag), enforcing the F4 carve-out in code — the site cannot be accidentally indexed before real legal + content exist.
- A **`publish` flag** in `site.config` gates: search-indexing, the sitemap's inclusion in `robots`, and a build-time check that Privacy + Terms are real (not placeholder) before a production/publish build is allowed.

## 2. Admin-editable content — CMS architecture (addendum requirement)

**Requirement:** ZAYA admin staff edit all website content through a friendly interface,
**without a developer and without touching code.**

### 2.1 Decision — **Decap CMS** (git-based), with Tina as the friendlier-visual alternative

| Option | Fit vs the constraints | Verdict |
|---|---|---|
| **Decap CMS** (OSS) | Content lives **in the git repo** (Markdown/JSON) → **no new database**; its **own separate editor login** (Git Gateway / GitHub OAuth); free forever, no per-seat limits; clean form-based editor (rich text, media library, collections, draft→publish workflow); battle-tested with Astro. | **Recommended default** — the only option that honors *no new backend / no new database* purely while giving non-technical staff a real CMS. |
| **Tina CMS** (git-based + Tina Cloud auth, free tier) | Content in git too; **inline/visual editing on the live preview** (friendliest for non-technical staff); Tina Cloud manages editor accounts (no GitHub needed) but is a third-party auth/media service, free tier ~2 editors. | **Alternative** if inline visual editing is the priority and the free-tier seat limit is acceptable. |
| Sanity / Storyblok (hosted) | Friendliest editors, but content lives in an **external hosted content database** → in tension with the *no new database* constraint. | Not chosen (constraint). |

**Rationale:** the hard constraint is *no new backend, no new database, no duplication of
platform auth.* Decap keeps content in the repo (versioned, reviewable, zero external
store) and uses a **separate website-editing login** entirely distinct from ZAYA platform
user auth — exactly the separation the founder specified. Because **all content is
structured as collections/config from day one**, Tina can be swapped in later with no
content migration if the visual editor is preferred.

### 2.2 What is editable from day one (CMS collections / config)
- **Marketing copy** — homepage sections, audience pages, About (content collections; rich text).
- **Pricing** — `pricing.config` (tiers, prices, discounts) as a CMS-editable data file.
- **Contact details** — `contact.config` (email, phones, form endpoint, privacy line).
- **Blog / News** — `content/blog/*` posts (title, date, cover, body, locale, draft).
- **Testimonials** — `content/testimonials/*` (marked placeholder until real; F4).
- **Partner logos** — `content/partners/*` (marked placeholder until real; F4).
- **Careers** — `content/careers/*` listings.
- **Images / media** — media library folder in the repo (`src/assets` / `public/uploads`).
- **Nav labels + StatusTags** — `nav.config` / feature-flag file.

Nothing above is hardcoded in a component; each is a CMS collection or config file, so an
edit never needs a code change or a developer.

### 2.3 Editor auth & roles (separate from platform auth)
- The CMS admin panel lives at **`/admin`** (static, served by the site) and authenticates
  editors via **its own separate login** (Git Gateway/GitHub for Decap; Tina Cloud for
  Tina). This is a **website-editing tool only** — no connection to ZAYA platform user
  authentication, sessions, or the API gateway.
- **Roles:** a single minimal **Editor** role for admin staff (create/edit/publish
  content). No complex permission matrix (founder: "keep it minimal").
- The exact editor-auth provider is finalized at deploy (like the form service); Decap's
  Git-Gateway/GitHub backend is the recommended default.

### 2.4 What this CMS is NOT
It is **not** the future ZAYA platform admin/ops console (a Flutter Web portal on the
existing backend). That is a separate product, on the one backend, **not built here**.
This CMS edits only the marketing website's content.
