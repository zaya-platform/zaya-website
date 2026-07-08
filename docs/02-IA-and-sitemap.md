# 02 · Information Architecture & Sitemap

## 1. Sitemap (tree)

```
/  (Home)
├── /about                         About / Our Story
├── /solutions                     Solutions (index — who we serve)
│   ├── /solutions/merchants       Shop owners
│   ├── /solutions/supermarkets    Supermarkets / enterprise
│   ├── /solutions/customers       Customers
│   ├── /solutions/delivery        Delivery partners
│   ├── /solutions/diaspora        Diaspora  ★ strategic, prominent
│   └── /solutions/suppliers       Suppliers  (Future — teaser only)
├── /pricing                       Pricing (config-driven tiers)
├── /partners                      Partners  (placeholder logos)
├── /careers                       Careers   (placeholder roles)
├── /blog                          News & Blog (index)
│   └── /blog/[slug]               Post template
├── /help                          Help Center (index)
│   └── /help/[slug]               Guide pages  ("Learn ZAYA in minutes")
├── /faq                           FAQ
├── /contact                       Contact + "Join the pilot" form
├── /privacy                       Privacy Policy   (legal copy — founder-supplied)
├── /terms                         Terms of Service (legal copy — founder-supplied)
│
├── GATEWAY (nav entry points — build now, "coming soon")
│   ├── /signin                    → app.zaya.et  (Pilot access — coming soon)
│   ├── /get-started               → role selection
│   └── /get-started/[role]        Merchant · Supermarket · Customer ·
│                                   Delivery · Diaspora · Administrator
│                                   (each → app.zaya.et coming-soon)
│
└── SYSTEM
    ├── /404, /500
    ├── /sitemap.xml, /robots.txt
    └── /[locale]/…                 am · om · ti · en variants of every route
```

## 2. Navigation model

**Primary header (desktop):** Logo · **Solutions ▾** (mega-menu: the 6 audiences with a
one-line pain→solution each) · **Pricing** · **About** · **Resources ▾** (Help · Blog ·
FAQ · Partners · Careers) · **Language ▾** (am/om/ti/en) · **Sign In** (ghost) ·
**Get Started** (primary CTA). On mobile: a hamburger drawer with the same structure,
Language + the two gateway CTAs pinned at the bottom.

**Footer (4 columns + base):**
1. **Product** — Merchants · Supermarkets · Customers · Delivery · Diaspora · Pricing
2. **Company** — About · Careers · Partners · Blog · Contact
3. **Resources** — Help Center · FAQ · Get Started · Sign In
4. **Get in touch** — email + two phones + "Join the pilot" CTA + language switch
5. **Base** — © ZAYA · Privacy · Terms · a small **"Live vs roadmap"** legend link.

## 3. URL & locale scheme

- Default locale **English at `/`** (no prefix); localized routes under `/am/…`,
  `/om/…`, `/ti/…` (prefix-per-locale — Astro i18n). `hreflang` + `x-default` on every page.
- Lowercase, hyphenated, stable slugs. Blog/help slugs are content-authored.
- Canonical URL per page; localized alternates declared.
- Gateway routes never expose an app path; they link out to `app.zaya.et` (external).

## 4. Live-vs-roadmap taxonomy (H1 — used site-wide)

A single **`<StatusTag>`** component with a fixed, honest vocabulary — no ad-hoc words:

| Tag | Meaning | Example use |
|---|---|---|
| **Live** (default: no tag needed on plainly-live things) | Available in the pilot now | Merchant sales/stock/credit book |
| **Launching** | In active build, near-term | Customer ordering, dashboard web view |
| **On the roadmap** | Planned, not yet built | Diaspora ordering, delivery-partner app, web catalogue tool |
| **Future** | Directional, unscheduled | Suppliers, "Mobility & Logistics — Future," broader ecosystem |
| **Pilot access — coming soon** | Gateway/portal links | Sign In, role selection destinations |
| **Placeholder** | Awaiting founder-supplied real content | Testimonials, partner logos, some photography |

Rule: **every** item that is not plainly live in the pilot carries exactly one of these
tags, rendered by the shared component so the wording can never drift.

## 5. Page → audience → primary CTA matrix

| Page | Primary audience | Primary CTA | Secondary |
|---|---|---|---|
| Home | All | Join the pilot | Explore solutions |
| Solutions/Merchants | Shop owners | Join the pilot (Merchant) | See pricing |
| Solutions/Supermarkets | Enterprise | Talk to us | Pricing (Premium Max) |
| Solutions/Customers | Customers | Get the app *(Launching)* | How it works |
| Solutions/Delivery | Riders | Register interest *(Roadmap)* | How it works |
| Solutions/Diaspora ★ | Diaspora | Get notified *(Roadmap)* | How it works (4 steps) |
| Pricing | Merchants | Start free | Compare tiers |
| Contact | All | Join the pilot | Email / call |
| Get Started / role | All | Continue → app.zaya.et *(coming soon)* | Back to solutions |

## 6. Content ownership (who edits what)

- **Config files** (non-technical editable): pricing tiers, contact details, nav labels,
  feature flags for live/roadmap tags, language toggles.
- **Content collections** (Markdown/MDX): blog posts, help guides, FAQ, careers roles,
  audience-page body copy.
- **Locale files**: one message file per language for shared UI strings + hero/CTA copy.
- **Brand tokens**: one token file swaps the whole look (colors/type) — see doc 06.

The README (deliverable #8) documents each of these with copy-paste examples.
