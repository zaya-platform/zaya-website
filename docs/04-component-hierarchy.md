# 04 · Component Hierarchy & Design System

A small, disciplined library: **tokens → primitives → molecules → sections → page
templates.** Components are brand-driven (doc 06), accessible by construction, and
motion-aware. Astro components (`.astro`) for static UI; a handful of framework islands
(e.g. Preact/vanilla) only where interactivity is genuinely needed (hero, language
switch, mobile nav, pricing toggle).

## 0. Foundations (tokens & styles)
- **`tokens.css`** — the design tokens (colors, type scale, spacing, radius, shadow,
  motion durations/easings) generated from the official brand (doc 06). One file swaps
  the whole look.
- **`typography`** — Poppins (Latin) + Noto Sans Ethiopic (am/ti); fluid type scale.
- **`motion`** — shared keyframes (radar pulse, reveal, hover lift) + a
  `prefers-reduced-motion` guard mixin.
- **`a11y`** — focus-ring, visually-hidden, skip-link utilities.

## 1. Primitives (atoms)
`Button` (primary/ghost/link, sizes, busy) · `Link` · `Icon` (Tabler wrapper) ·
`Heading`/`Text` (semantic scale) · `Tag`/`Badge` · **`StatusTag`** (the honest
live/roadmap vocabulary — §doc 02.4; the ONLY way not-live status is shown) ·
`Input`/`Textarea`/`Select`/`Field` (form primitives, labelled + error slots) ·
`Card` · `Container`/`Section`/`Grid` (layout) · `Image` (responsive/lazy/`alt`
-required) · `Logo` (the official mark, with on-light/on-dark variants) ·
`Illustration` (light SVG/icon slots where photos aren't supplied).

## 2. Molecules
`NavItem` / `MegaMenu` · **`LanguageSelector`** (am/om/ti/en, each in its own script;
island) · `CTAButtons` (Sign In ghost + Get Started primary) · `AudienceCard` (icon +
pain→solution one-liner) · **`TodayVsZaya`** (the "Today pain → With ZAYA benefit" two-
column block, Part 6) · `PriceCard` (tier from config) · `PricingToggle` (monthly /
6-month −5% / annual −10%; island) · `FeatureRow` · `StatCounter` (animated, reduced-
motion aware) · `GuideCard` ("Learn ZAYA in minutes") · `StepItem` (numbered how-it-
works) · `FAQItem` (accessible disclosure) · `PlaceholderBlock` (marked testimonial /
partner-logo slot, H3) · `ContactChannel` (email/phone rows) · `SocialProofPlaceholder`.

## 3. Sections (organisms — the homepage & audience narrative)
- **`NearYouHero`** ★ — the signature animated hero: the brand's radar "zone rings"
  pulsing around a location pin, reacting to the cursor; headline + tagline "Everything
  near you." + the two gateway CTAs + language switch. Island; reduced-motion → static.
- `ProblemsWeSolve` · `WhoWeServe` (grid of `AudienceCard`) · `HowZayaHelps` ·
  `PlatformOverview` · `MerchantStory` · `CustomerStory` · `SupermarketStory` ·
  **`DiasporaStory`** (prominent, 4-step) · `FutureVision` (ecosystem, honestly tagged) ·
  `WebWorkspaceTeaser` ("manage your stock from the web" — roadmap) ·
  `Testimonials` (Placeholder) · `Partners` (Placeholder) · `FAQSection` ·
  `CTASection` ("Join the pilot") · `Footer` · `Header`/`MobileNavDrawer`.

## 4. Page templates
`BaseLayout` (head/meta/OG/hreflang, header, footer, skip-link, locale context) →
`HomePage` · `AboutPage` · `SolutionsIndex` · `AudiencePage` (parametrised for the 6
audiences) · `PricingPage` · `PartnersPage` · `CareersPage` · `BlogIndex` /
`BlogPost` · `HelpIndex` / `GuidePage` · `FAQPage` · `ContactPage` · `LegalPage`
(Privacy/Terms) · `GatewayComingSoonPage` (Sign In / role selection) · `ErrorPage`.

## 5. Cross-cutting behaviours
- **Motion controller** — a single utility that respects `prefers-reduced-motion`,
  uses `IntersectionObserver` for scroll reveals, and caps concurrent animations.
- **Locale context** — provides the active language + message lookup to all components;
  the `LanguageSelector` updates the URL + persists the choice.
- **Config binding** — `PriceCard`, `ContactChannel`, nav labels, and `StatusTag`
  defaults read from config/content so non-technical edits need no component changes.
- **SEO head** — a `<SEO>` component every page uses (title/description/OG/canonical/
  hreflang/structured data).

## 6. Component acceptance (definition of done)
Each component: renders responsively; is keyboard-operable with a visible focus state;
has no color-only meaning; honors reduced-motion; requires `alt` on images; exposes a
`StatusTag` slot where it can carry a not-live item; and has a catalogue entry (a simple
`/styleguide` dev page listing every primitive/molecule for visual regression — dev-only,
not shipped in the public sitemap).
