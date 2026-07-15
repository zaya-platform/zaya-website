# Website Phase 1 — interactive polish (Astro-native, measured, honest)

**Status: BUILT — parked for the founder preview gate. Not merged, not deployed.**
Branch `feat/phase1-interactive-polish`. Separate `zaya-website` repo — the platform
monorepo and the app sprint (BXP / Pack-2 / S7) were **not** touched.

---

## 1. Stack assessment (confirmed)

- **Astro ^4.15**, static output, **zero backend**. Ships ~zero JS by default; one small
  hoisted bundle (`dist/_astro/hoisted.*.js`, 9.6 KB raw / 3.9 KB gz) carries all
  interactivity (tabs, burger, lightbox, reveal, FAQ, assistant).
- **Already animating with CSS** (floaty logo, orbit drift, hero photo drift, card float,
  pulse dot, ken-burns) — **no animation libraries** in `package.json`.
- **AI assistant already exists** — `src/components/AssistantWidget.astro` (FDR-019,
  W-D4a founder-access preview). Left untouched; every `data-open-assistant` hook still
  works. This pass did **not** re-plan the assistant.
- Existing scroll-reveal (`.reveal` → `.in` via `IntersectionObserver`) and an
  accessible role-tab island (roving `tabindex`, arrow/Home/End keys) were **already
  present**. Phase 1 **extends** them rather than reinventing.

**Conclusion:** the correct move is Astro-native enhancement *with* the grain — CSS +
`IntersectionObserver` + tiny vanilla islands. No framework, no heavy runtime.

## 2. What shipped (Phase 1 scope A–E)

| # | Item | How (Astro-native) |
|---|---|---|
| **A** | **Hero entrance** | CSS `@keyframes heroRise` — a gentle staggered rise of eyebrow → h1 → sub → chips → CTAs → proof. Content is in the DOM and **every control is clickable from first paint** (opacity never sets `pointer-events`); nothing gates the CTAs. |
| **B** | **Scroll reveals** | Extended the existing `IntersectionObserver` to a restrained `.reveal-seq` (children rise in sequence, capped delay) on: merchant benefits, customer benefits, the diaspora **vision** grid, the "how it works" flow, and the pilot-CTA band. No scroll-jacking. |
| **C** | **Count-ups** | **Omitted — by design.** There is no approved real metric (users/merchants/revenue) on this site; per the directive, no number was invented. |
| **D** | **Audience toggle** | Rebuilt to the **honest set**: **Merchant** (live) · **Customer** (launching) · **Diaspora** (relabelled **"Our vision · not live yet"**). **Rider dropped** (delivery is shop-managed — not a ZAYA product); its dead hero-chip removed; the hero sub-copy no longer name-drops unbuilt verticals as live. Still the same accessible island, updates without a reload. |
| **E** | **Lottie micro-interaction** | **Skipped.** No interaction justified a licensed asset over the existing CSS/SVG. **0 new dependencies** — the budget-honest outcome the tool policy prefers. |

Plus a robustness upgrade the directive asked for: all entrance/reveal animation is now
**JS-gated** (`html.js`, set inline in `<head>` before paint). With JS disabled or the
bundle failing to load, the **full static page renders** — no hidden copy (previously
`.reveal` hid content unconditionally). Reduced-motion now also neutralises the
`.role-pane` crossfade that was previously left animating.

## 3. Dependencies & licensing

**0 new dependencies** (runtime deps unchanged: `astro` + `@astrojs/sitemap`). No Lottie /
Rive / Three.js / GSAP. **0 new asset/image files.** Nothing new to license. Existing
photo rights are unchanged and still gated by `scripts/check-publish.mjs`.

## 4. Performance — measured (before → after, `build:draft`)

| Bundle | Before | After | Δ raw | Δ gzipped |
|---|---|---|---|---|
| JS (hoisted) | 9,638 B | 9,650 B | **+12 B** | **+6 B** |
| CSS (site) | 48,160 B | 49,254 B | +1,094 B | +195 B |
| `index.html` | 40,527 B | 39,415 B | **−1,112 B** | −456 B |
| **Net page weight** | — | — | **−6 B** | **−255 B** |

- **Added JS ≈ 0** (+6 B gz — a single extended selector). **No new JS bundle.**
- The page got **smaller overall** (dropping the Rider tab + pane outweighs the CSS).
- **CLS:** entrance/reveal use `opacity` + `transform` only (compositor-only, no layout
  reflow) → no layout shift introduced. **LCP:** the hero `h1` starts its fade at ~90 ms
  and is fully painted well under a second; measure on-device (checklist below) — dial
  the delays down if any regression shows.
- **Interaction responsiveness / TBT:** unchanged — no new JS work on the main thread.

*Not measured in this environment (no headless Chrome/Lighthouse here — stated honestly,
not claimed):* on-device mobile Lighthouse **performance + a11y**, real LCP/CLS field
values. These are on the founder-preview checklist (§7) to capture on a real phone.

## 5. Accessibility

- `prefers-reduced-motion`: same content, **no motion** (reveal/reveal-seq shown
  un-transformed; hero entrance + role-pane crossfade disabled — `!important` overrides).
- Toggle: unchanged accessible tabs (roving `tabindex`, Arrow/Home/End, `aria-selected`,
  `role="tab"/"tabpanel"`), now over 3 honest roles.
- Semantic HTML, visible focus, alt text, contrast, no flashing — all preserved. Motion
  never gates navigation, and no-JS shows everything.

## 6. Tests

Dep-free node contracts (repo convention), `npm test`:
- `scripts/test-interactions.mjs` — **new** (26 checks, all green): honest toggle set +
  Rider dropped; tab↔pane bijection & single-active simulation; reduced-motion
  neutralisation; the no-JS/`html.js` fallback; no heavy deps; no invented metric.
- `scripts/test-assistant.mjs` — **unchanged, still green** (assistant untouched).
- `npm run build:draft` — clean (3 pages).

## 7. Founder preview — Tailscale gate (STOP here)

The website is a **separate** process from the app demo stack (no Docker, no ports the
app preview uses), so it does not disturb the app sprint.

**Serve it (this machine, on the private tailnet):**
```
cd "D:/ZAYA App Project/zaya-website"
npm run build:draft
npm run preview -- --host 0.0.0.0 --port 4330
```
**Open (desktop + phone on the tailnet):**
- Desktop: `http://100.97.219.52:4330/`
- Phone: same URL. (Or, if you prefer, a Netlify **branch deploy** of
  `feat/phase1-interactive-polish` gives a noindex preview URL — your call; nothing is
  published.)

**Look-for checklist:**
1. **Hero** rises in gently on load; the headline is readable immediately and **both CTAs
   are tappable from the first moment**.
2. Scroll down — **merchant / customer / diaspora benefits, the "how it works" steps, and
   the "Ask ZAYA" band** rise in as they enter view (restrained, once each).
3. **"Choose your ZAYA"** shows **three** tabs — Merchant, Customer, Diaspora. **No
   Rider.** Diaspora reads **"Our vision · not live yet."** Tap between them (and use
   arrow keys) — copy swaps with a soft crossfade, no reload.
4. Phone **Settings → reduce motion ON**, reload: everything is **instantly visible, no
   motion**, all content present.
5. Airplane-mode / JS-off sanity: the page still shows **all** content (nothing blank).
6. *(Optional)* run **Lighthouse** (Chrome DevTools → Lighthouse → Mobile) on desktop and
   note Performance + Accessibility, LCP, CLS — so we have real-device numbers.

**No Phase 2 until you approve.**

## 8. Known limits & flags for your decision

1. **Rider/Supplier content elsewhere (recommended follow-up, not done here).** This PR
   fixed the **toggle** (the interactive surface) + the hero. But Rider still appears as a
   full **"Why riders love ZAYA"** section, a "Riders" column in *The problem today*, a
   footer "Riders/Suppliers" link, the `Base.astro` meta description, and
   `content/data/{home,faq}.json`. Suppliers is in the same bucket. Removing/relabelling
   those is a **content-strategy decision** (remove entirely, or keep as clearly-labelled
   roadmap?) beyond "interactive polish" — I did not silently delete marketing sections.
   Say the word and I'll do a small **honesty content pass** to reconcile the whole site
   to the toggle's honest set.
2. **Dormant `#eco` canvas** in `site.js` still lists Riders/Suppliers nodes — but it's
   **not rendered** on any page (the script returns early), so nothing shows. It'd be
   cleaned up in the same content pass.
3. **On-device Lighthouse** numbers are for you to capture on the preview (§7); I reported
   only what I could measure rigorously (bundle deltas) and did not claim numbers I
   couldn't run here.

## 9. Recommended Phase 2 (NOT implemented — for your go)

- **Honesty content pass** (item 8.1) — reconcile the whole site to the honest audience
  set; retire the dead `#eco` nodes.
- **A real, approved metric** for a tasteful count-up *if and when one exists* (e.g. "N
  pilot shops in Addis") — never invented.
- **One considered micro-interaction** where it earns its place (e.g. an SVG "near-you
  radar" ping on the hero) — CSS/SVG first; a licensed Lottie only if it measurably wins
  and you approve.
- **Localised entrance copy** once am/om/ti native review lands (deferred site-wide today).
- Re-run the full budget on each and keep the same before/after discipline.
