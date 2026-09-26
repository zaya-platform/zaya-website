# Asset provenance

## Photography

`public/images/addis-portrait.jpg` and `addis-portrait-small.jpg`

- Photographer: **Abiy Fikru**.
- Source: https://www.pexels.com/photo/happy-young-woman-smiling-outdoors-in-ethiopia-33985819/
- Source description/location: portrait photographed outdoors in Addis Ababa, Ethiopia.
- License: https://www.pexels.com/license/ (checked 6 September 2026).
- Used for editorial visual context, with credit in the page caption. No claim that the subject is a ZAYA user, employee or endorser.
- Downloaded in 1400 px and 700 px variants. No generative edits, face replacement, or AI retouching.

## Product screenshots

Downloaded from the current user-specified ZAYA website on 6 September 2026:

- `customer.png`: https://zayaethiopia.netlify.app/_astro/customer_browse_en.B96knoW4.png
- `merchant.png`: https://zayaethiopia.netlify.app/_astro/merchant_dashboard_en.ClwgB4Gx.png

The current site identifies these as captures from 23 August 2026, using seeded demonstration data. The redesigned site preserves that distinction.

## Official brand and typography

The July 7, 2026 master assets in the current connected repository supersede the older D: Brand Story Sheet used in the first local draft.

- Repository: https://github.com/zaya-platform/zaya-website (reviewed main revision 6b13ba1154962010dc3da2e04d8ad9d03e9581ce).
- `public/brand-horizontal.svg`: `brand/2026-07-07_ZAYA_Logo_Horizontal.svg`.
- `public/brand-icon.svg`: `brand/2026-07-07_ZAYA_Logo_AppIcon.svg`.
- Self-hosted Poppins 400/500/600/700 WOFF2 files copied from the current repository's public fonts. No external Google Fonts request.
- Teal #0EA5A4, Coral #FF7A45, Navy #1E2A4A, Cloud #F4F7F8. Large surfaces use Cloud and pale teal; navy is primarily text. Coral matches the founder ruling and implemented token.

The additional `compare.png` and `credit.png` are actual comparison and merchant credit screens from the recent live site, using seeded August 2026 data. No live transactions are represented.

## Code visuals

The delivery route and parcel, and small dimensional Promo logo treatment are HTML/CSS/SVG design elements. They do not purport to be photos or operational maps. Decorative hero orbit lines are hidden in the final layout. The video poster below is the supplied raster cover, not a fabricated app screen.

### Social sharing image — 26 September 2026

`public/images/zaya-share-1200x630.png` is a derived composition of official brand assets only: the July 7 horizontal logo (`public/brand-horizontal.svg`) centred on the cloud page background `#F4F7F8`. It was produced by `scripts/make-share-image.mjs` (rasterised with the project's existing Sharp dependency, 660 px logo width at 300 dpi vector density). No new artwork, no text rendering, no generative edits, no colour or proportion changes to the logo. Provenance of the underlying logo is the repository record above. Used as `og:image` and `twitter:image`; it replaces the portrait photo in those tags only — the portrait remains in the page with its original credit.

### TikTok profile link — 26 September 2026

`src/data/social.json` gains `tiktokUrl` → https://www.tiktok.com/@zayaappethiopia (address verified by the advisor audit, 25 September 2026). The footer link reuses the existing neutral external-link arrow text pattern already used by the YouTube link ("TikTok ↗"). No TikTok logo file was added to the project; none existed in the package and none was invented. If the owner later wants the official TikTok glyph, it should come from TikTok's published brand assets (respecting TikTok's trademark terms) and be recorded here with its source and date.

## User-selected ZAYA Promo

On 7 September the user supplied https://chatgpt.com/s/cx_6a9dd70ce0cc81918f4e21159c986df8 and selected the latest ZAYA_Bright_Revision exports. The 45-second H.264/AAC video is included in 1080 × 1920 and 2160 × 3840 versions, with its supplied cover. That project reports original music, native 4K graphics and generated 1080p character footage. The homepage portrait remains real photography; the supplied promo contains generated characters. These media are used at the user’s direction, without new generative edits.

### Optimized poster derivative — 8 September 2026

`public/images/zaya-promo-cover.webp` is a proportionally resized and compressed derivative of the supplied `zaya-promo-cover.png`. Existing Sharp was used to produce a 720 × 1280 WebP at quality 84. Composition, text, colours and subject content were preserved; there was no crop, compositing or generative alteration. The original PNG remains in the project.

- Original: 2160 × 3840 PNG, 2,304,341 bytes.
- Served derivative: 720 × 1280 WebP, 38,422 bytes (98.3% fewer bytes).
- The derivative was visually inspected against the supplied cover; the existing source/provenance above applies to both files.
