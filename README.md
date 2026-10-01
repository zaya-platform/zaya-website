# ZAYA website

An Astro static website rebuilt from the recent public ZAYA website and the local ZAYA brand and product documents. This is a separate project; the original D: folders remain unchanged.

The website and guided Jev enquiry routing are hosted at [zayaethiopia.netlify.app](https://zayaethiopia.netlify.app). See `DEPLOYMENT.json` for the latest recorded deployment and `VALIDATION.json` for its checks and limits. Production includes the `jev-triage` Netlify function and a protected production API secret. No Git commit or push was performed. Existing ZIP archives still reflect an earlier publication.

The Features dropdown and interactive “What is ZAYA?” update is published. All ten HTTP publication checks passed, and live checks confirmed comparison-screen navigation, the `#meaning` link and letter expansion without console errors. See [Features release notes](../ZAYA-Features/RELEASE-NOTES.md) for its evidence and limits.

## Preview

Requires Node.js 22.12+ or 24 and npm.

```powershell
cd "C:\Users\Chala.Zekariyas.MSIE\Documents\Codex\2026-09-06\p\outputs\zaya-website"
npm run build
npm run preview -- --port 4341
```

The preview command above serves the build at http://127.0.0.1:4341. Dependencies are already installed; run `npm ci` first only when setting up a fresh checkout. For live source editing, `npm run dev` starts the development server at http://127.0.0.1:4321 when that port is available.

## Build and validate

```powershell
npm run check
npm test
npm run build
npm run preview -- --port 4341
```

`dist/` contains the most recent local static build; publication is recorded separately in `DEPLOYMENT.json`. Existing hosting ZIPs predate these refinements. Serve the build through a local web server; opening index.html with a file:// URL will not resolve root-relative assets correctly.

`netlify.toml` targets the existing Netlify site. See the delivery report for the latest deployment status. If the final hostname changes, update `site` in `astro.config.mjs` and the canonical and Open Graph URLs in `src/pages/index.astro`.

## Optional Jev enquiry routing

The guided enquiry preview calls `/.netlify/functions/jev-triage`. Configure these server-side Netlify environment variables before enabling it in production:

- `JEV_API_KEY` — required; never expose this value in browser code or commit it.
- `JEV_API_URL` — optional; defaults to the independent hosted gateway at `https://jevtypesafeai.com/api/v1/decide`.
- `JEV_MODEL` — optional; defaults to `jev-latest`. Pin a reviewed model version for production.

The function removes common email, Ethiopian mobile-number and payment-card patterns before sending the message, returns only routing metadata to the browser, and does not log the submitted message. The email step remains user-controlled.

Production verification on 20 September 2026 confirmed the live page, privacy disclosure and end-to-end function call. A synthetic late-delivery message returned the `delivery` route and the browser presented “Delivery support,” “Review today” and “Personal review recommended.”

## Structure

- `src/pages/index.astro`: homepage content, audience tabs and page structure.
- `src/styles/global.css`: canonical shared tokens, responsive layouts and accessibility styles; the former `refresh.css` has been removed.
- `src/components/FeaturesMenu.astro` and `src/styles/features.css`: native Features dropdown with nine grouped navigation links; phone visitors use Menu → Features.
- `src/components/ExploreMenu.astro` and `src/scripts/explore-menu.ts`: directly visible header Explore ZAYA disclosure with four audience icon links, keyboard handling and measured header space for its expanded panel.
- `src/components/Neighbourhood.astro` and `src/scripts/neighbourhood.ts`: independent homepage scene and motion lifecycle; audience navigation highlights a node without replacing or hiding the model.
- `src/components/BrandMeaning.astro`: “What is ZAYA?” with four native letter disclosures, preserving `#meaning`.
- `src/scripts/navigation.ts`: feature/screen selection, audience-aware links, keyboard and nested-menu handling, active navigation and motion preference.
- `src/scripts/experiences.ts`: app-screen choices, native enlarged-screen dialog and delivery-step controls.
- `src/components/Promo.astro`: compact optional video section and playback recovery.
- `src/pages/privacy.astro`, `terms.astro`: informational website privacy and availability disclosures.
- `public/images/`: genuine Addis Ababa photography and screenshots from the recent ZAYA site.
- `public/brand-horizontal.svg` and `brand-icon.svg`: July 7 master branding from the current connected repository.
- `public/_headers`: static hosting security and image caching headers.

## Features and brand meaning

Features links cover shopper browsing/comparison, merchant sales-stock-orders/customer credit, shop-managed delivery, ZAYA Promo, What is ZAYA?, and the clearly labelled planned RIDE/Diaspora experiences. Shopper comparison and merchant credit links reveal the appropriate audience and corresponding real app screenshot. Keyboard navigation, nested Escape dismissal and focus return support the desktop dropdown and phone menu.

“What is ZAYA?” explains **Z — Zonal, A — Availability, Y — Yours, A — Access** through native disclosures. The first opens initially; selecting another letter expands its short explanation. The section works without additional JavaScript and keeps the established branding and factual boundaries.

## ZAYA Promo

The homepage embeds the user-selected bright promo: the original 45-second edit plus a four-second branded YouTube closing card. Its 1080p version loads only when requested; visitors can select 4K while preserving the playback position. Native controls support seeking, volume and fullscreen. Loading feedback, retry and a direct video link provide recovery. Concise copy and a small static dimensional logo replace the previous interactive brand-story panels.

`src/data/promos.json` defines the local video list. Each entry supports a title, MP4 src, optional highQuality source, poster and captions path. Rebuild to preview changes; publication is a separate action. The supplied poster is now served as a smaller WebP derivative, with its original PNG retained. Source media: the user-selected ZAYA_Bright_Revision project; see ASSET-CREDITS.md. No unrelated footage is used.

## Content boundaries

- Public launch and app downloads are not offered.
- Merchant/customer/delivery testing status comes from the recent website and has not been independently validated on devices.
- Diaspora is explicitly planned.
- RIDE is explicitly a future roadmap direction. The separate shop-managed delivery workflow is the current product preview; it is not a passenger service.
- Guided enquiries send text to the disclosed external decision service through a server function; the result suggests a route. Contact links open email/phone apps. There is no automatic message to the ZAYA team, booking or pilot registration.
- Images do not imply the subjects endorse ZAYA.
- Homepage portrait photography is real. The user-selected ZAYA Promo contains generated character footage, as documented in its source project.

See [ASSET-CREDITS.md](ASSET-CREDITS.md) for provenance and [the refinement report](../ZAYA-Refinement/REFINEMENT-REPORT.md) for current checks, publication verification and remaining gaps. The delivery report retains the earlier publication history beneath its current deployment note.

Fonts remain self-hosted Poppins. The source retains noindex, consistent with the existing product-development posture. No working registration integration or approved translated website copy was supplied; email enquiries remain the real next step.

## Refinement documentation

The project-installed UI UX Pro Max and Impeccable skills were read and applied manually to this code-first refinement. [PRODUCT.md](PRODUCT.md) records verified product facts and gaps; [DESIGN.md](DESIGN.md) is the single canonical set of visual decisions for both skills. The homepage strategy is recorded in `.impeccable/surfaces/home.md`.

The [refinement report](../ZAYA-Refinement/REFINEMENT-REPORT.md) contains the before/after evidence, actual verification results and preview instructions. The original refinement brief excluded deployment; later user authorization allowed the reviewed build to be published. No repository commit or push was performed. [Publication verification](../ZAYA-Refinement/publication-verification.json) records byte-exact HTTP 200 responses for the three pages, logo, optimized poster, JavaScript and both CSS files, plus matching 1024-byte HTTP 206 ranges for both MP4s.

Live browser smoke checks passed for homepage copy, mobile merchant navigation, screenshot dialog focus/Escape and advancing 1080p playback, with no console errors observed. Full-duration and live 4K playback were not reverified in this publication check.

This separate source folder has not yet been synchronized to the connected GitHub repository. A manual Netlify publication can be overwritten by a later automatic build of the older repository. Synchronize this reviewed source before the next Git-triggered release. The replacement is an informational Astro site with the Jev guided-enquiry function; it does not include the former CMS/admin.

## Interactive neighbourhood (September 20, 2026)

The header's Explore ZAYA control opens one native dropdown with Customers / Merchants / Riders / Diaspora icon links. It remains directly visible beside the brand on phones, outside the secondary navigation Menu. The audience panel uses four columns on desktop and two on mobile/tablet, with short descriptions and availability status. Its measured height is reserved in the header so it pushes the hero down rather than covering the model, and it closes before navigating to audience details.

The optional Three.js scene is a separate permanent part of the homepage: menu interactions do not replace or hide its canvas. Choosing an audience highlights its node and connection; customer and merchant links activate the corresponding real app walkthrough. On phones, the compact introduction is followed by the scene, with secondary hero copy and actions below. Riders means shop-managed delivery; Diaspora and RIDE retain their planned status. The documented ZAYA expansion is Zonal, Availability, Yours, Access. The scene uses the official logo and local geometry, without new third-party media or tracking requests.

The 3D code is a separate, dynamically imported chunk (approximately 138 KB gzip). It loads on visibility for eligible devices. Data saver, 2G, device hints of 2 GB memory or two CPU threads, disabled motion, and unavailable WebGL use a geometric fallback. All audience copy and links are server rendered and remain available without JavaScript. The scene pauses offscreen/background; local pause and persistent website motion controls support user choice. Pointer movement affects lighting/perspective; scroll subtly changes perspective and never changes the selected audience.

Production build verification and the actual tested viewport sizes are recorded in VALIDATION.json. The asset-size warning for the optional Three.js chunk is expected; initial HTML and core controls do not statically import it.

## YouTube

Official channel: https://www.youtube.com/@ZAYAAppEthiopia
Public promo: https://youtube.com/shorts/UUYVk6rHZbs
The homepage player includes the original promo plus a four-second branded channel closing card. Social URLs are in src/data/social.json.

## Interactive scene and enquiry fixes (October 2026)

The hero scene now has its own explorer: four highlight buttons (Customers, Merchants, Riders, Diaspora) with a detail card giving each one's availability status and a link to its section. Visitors can drag to turn the 3D model and tap a shape to select it; selecting Riders shows a parcel travelling a dotted route from the shop to the shopper. The delivery section gains a “Play the journey” control. Reduced motion, data saver and low-capacity devices keep the static diagram, where the explorer and tapping still work. `DESIGN.md` records the details.

Guided-enquiry fixes in the same change: email subjects are no longer double-encoded; a long message that only begins with a bank question goes to the review flow instead of a canned answer, and instant-answer emails keep the visitor's own words; the redaction filter now removes Ethiopian mobile (09…/07…) and landline numbers written with or without +251/0 prefixes and spaces, dots or dashes. `npm test` runs the unit tests (`test/*.test.mjs`).
