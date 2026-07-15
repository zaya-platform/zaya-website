# ZAYA website — working rules (Digital Front Door)

This is the **standalone marketing site** (`zaya-platform/zaya-website`), **not** the
platform monorepo. Astro ^4.15, static, zero-backend. "One backend, many front doors."
Never pull app/platform code in here; never edit the platform from here.

## Motion & interactivity — Astro-native first
Astro's value is minimal JS for cheap phones / slow Ethiopian networks. Enhance *with*
that grain, not against it.
- **Default:** CSS animations + `IntersectionObserver` scroll reveals + tiny vanilla
  `<script>` / small Astro islands. Reveal is done via `.reveal` / `.reveal-seq`
  (`src/styles/site.css` + `src/scripts/site.js`).
- **Heavy libs (Lottie / Rive / Three.js / GSAP): not by default.** Add one ONLY when a
  specific effect *measurably* needs it, it passes the perf budget below, its asset is
  **locally stored + licensed** (record source + licence in `src/assets/**`), and the
  **founder approves** — with written justification. Prefer a CSS/SVG equivalent first.
  Community `.riv`/Lottie files never ship in production.

## Performance budget (measure — no claim without numbers)
Report **before/after** for any interactive change: added JS KB (target **~0 added JS**),
asset KB, mobile Lighthouse performance + a11y, LCP, CLS. Measure raw + gzipped `dist`
deltas (`build:draft`, then diff `dist/_astro/*` + `index.html`). Interactivity must not
add a render-blocking bundle; scroll/entrance animations must not cause layout shift (CLS).

## Accessibility (binding)
Honour `prefers-reduced-motion` (same content, no motion — via the reduced-motion blocks
in `site.css`). Keyboard-operable controls, visible focus, semantic HTML, contrast, alt
text, no flashing. Motion must never gate navigation or hide content. Animations are
**JS-gated** (`html.js`, set inline in `Base.astro`): with JS off or the bundle failing,
the full static page renders — never blank space.

## Honesty (F4 — binding, enforced in code)
- No unsupported/unapproved claims. **No invented metrics** (users/merchants/revenue/
  transactions) — if there's no approved number, omit the count-up.
- **Unbuilt verticals (Diaspora / Ride / Suppliers) appear only as clearly-labelled
  vision/roadmap, never as live products.** Delivery is shop-managed at pilot — there is
  no "Rider" ZAYA product.
- Real ZAYA brand only (teal `#0EA5A4` / coral `#FF7A45` / navy `#1E2A4A`). Never a
  Google-style concept logo or any third-party mark used as our own (trademark hazard,
  on the record).
- The site stays `published:false` behind the F4 publish gate
  (`scripts/check-publish.mjs`) until real domain + legal copy + founder go. Use
  `build:draft` for noindex preview builds. Don't touch the legal pages/forms without the
  founder.
- The AI assistant already exists (`AssistantWidget.astro`, FDR-019). Reconcile with it;
  don't re-plan it.

## Process
- Focused feature branch → reviewable PR. **Founder preview gate** (Tailscale/Netlify
  draft) with desktop + phone URLs; **stop for founder review** before the next phase.
- Tests are dep-free node scripts (`scripts/test-*.mjs`, `npm test`). Add contract tests
  for new behaviour (toggle, reduced-motion, no-JS fallback). Run `npm run build:draft`.
- No new **heavy** dependency without a measured, founder-approved justification.
