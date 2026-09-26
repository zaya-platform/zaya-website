# ZAYA

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Shoppers who want to discover neighbourhood shops and compare products and prices.
- Merchants who need to organise sales, stock, orders and customer credit.
- People interested in the planned Diaspora experience, providing everyday essentials for family in Ethiopia through neighbourhood shops.

## Product Purpose

ZAYA is being developed in Addis Ababa, Ethiopia. The marketing website helps visitors understand the product, find the experience relevant to them and contact the team with a launch-update or merchant-pilot enquiry.

## Positioning

“Everything near you.” connects local shop discovery with practical tools for the people running those shops. The website is an informational product preview, not access to a live shopping or transport service.

## Operating Context

Visitors may use phones, tablets or desktop computers and may have limited bandwidth. They can review real app captures containing seeded demonstration data, explore a shop-managed delivery diagram, watch the optional ZAYA Promo and open their email or phone app to contact the team.

## Capabilities and Constraints

- Customer, merchant and shop-managed delivery tools are described as in device testing. This status comes from the supplied website context; website implementation does not independently validate the apps on devices.
- Public access, launch date, public service areas and public pricing are not confirmed.
- Shop-managed delivery associates an order with the shop’s own deliverer and records completion. It is distinct from the planned RIDE concept.
- RIDE service details are still being defined. Passenger rides and ride booking are not available.
- Diaspora ordering is planned and unavailable. ZAYA is not a money-transfer service.
- Language coverage, low-data behaviour and offline operation require launch validation. The current website is English; no approved translations were supplied for this refinement.
- The implementation is an Astro site with a Netlify function for the Jev guided-enquiry preview. It suggests a route but does not send a message to the team or register interest automatically. Email links are the enquiry route: `zayaapp@gmail.com`; telephone: `+251912835922`.
- An enquiry does not automatically register a visitor or guarantee pilot participation. A future registration form needs a real integration, minimal fields, validation, and truthful pending/success/failure states.
- No launch dates, supported locations, prices, testimonials, merchant counts, partnerships or app-store availability may be invented.

## Brand Commitments

Preserve the ZAYA name, official July 7 logo assets, “Everything near you.”, Ethiopian context, navy text, teal accents, orange actions and predominantly light surfaces. The voice is warm, trustworthy, local and practical. Preserve the established Poppins typography. `DESIGN.md` records the canonical visual decisions.

## Evidence on Hand

- Official assets: `public/brand-horizontal.svg` and `public/brand-icon.svg`.
- Actual app screenshots: `public/images/customer.png`, `compare.png`, `merchant.png` and `credit.png`. Keep their seeded demonstration-data labels visible.
- Authentic Addis Ababa portrait by Abiy Fikru: `public/images/addis-portrait.jpg` and its smaller version. The subject is not presented as a ZAYA customer or endorser.
- User-selected ZAYA Promo and its supplied cover. The promo contains generated scenes and concepts for future experiences; it is not a recording of current product operation.
- Existing official channel and promo addresses are in `src/data/social.json`.
- `ASSET-CREDITS.md` records provenance. No customer testimonials or partnership evidence are supplied.

## Product Principles

1. Explain concrete shopper and merchant outcomes before optional brand storytelling.
2. Make the difference between development, device testing and planned experiences clear.
3. Provide an honest next step whose wording matches what the website actually does.
4. Preserve authentic evidence and identify demonstration or conceptual content.
5. Keep the experience useful with limited bandwidth and without optional motion.

## Accessibility & Inclusion

Support keyboard navigation, visible focus, comfortable touch controls, screen enlargement with accessible close/focus handling, reduced motion and readable responsive layouts. Prepare wrapping and fallback typography for Amharic; do not expose a language switcher without complete approved translations. Required verification includes 360, 390, 768, 1280 and 1440 CSS pixels, relevant landscape layouts and 200% zoom. These are acceptance requirements, not claims of completed testing.
