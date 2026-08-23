// Founder-signed merchant tiers (CR-017-A, signed 2026-07-06 via FDR-008).
// Currency is ETB; customers use ZAYA free.
//
// PUBLICATION STATE (R2, 2026-08-23) — read before re-adding anything here to
// the page. The three PAID tiers are WITHDRAWN from the public site. Reason:
// there is no billing, subscription, entitlement or plan-gating code anywhere
// in the merged platform (verified by grep over the platform's 1,016 tracked
// files — the only hits for "billing/subscription/entitlement/stripe" are an
// awning "stripe" in an illustration and a layout comment). A priced tier with
// nothing behind it is an offer the product cannot honour, and the CR itself
// says so: "Non-goals — No billing implementation (ZEEB epic placement is a
// separate board item; do not pull earlier)."
//
// The signed record below is KEPT, not deleted — it is the binding SSOT
// amendment. `publish` says whether a tier may appear on the public site.
// Flip a paid tier to `publish: true` only in the same change that ships the
// billing code, and reconcile it against the CR table first (the site's old
// four-card block diverged from that table in eight places).
//
// This module is not imported by any page today; src/content/data/pricing.json
// is what renders (it is the CMS-editable copy). Keep the two consistent.
export const pricing = {
  currency: 'ETB',
  discounts: { sixMonth: 0.05, annual: 0.10 }, // ~5% / ~10% off (display copy reads from here)
  note: 'No hidden fees. Customers use ZAYA free.',
  paidLine: 'Paid plans for larger shops, published when billing opens.',
  tiers: [
    { id: 'free',    name: 'Free',        price: 0,   period: 'forever',  highlight: false, publish: true,
      headline: 'Free — 0 ETB — forever',
      blurb: 'Everything a small shop needs to start.', cta: 'Start free' },
    { id: 'starter', name: 'Starter',     price: 199, period: 'month',    highlight: false, publish: false,
      blurb: 'For growing shops that want more.',       cta: 'Choose Starter' },
    { id: 'pro',     name: 'Pro',         price: 299, period: 'month',    highlight: false, publish: false,
      blurb: 'The full toolkit for a busy shop.',       cta: 'Choose Pro' },
    { id: 'premium', name: 'Premium Max', price: 999, period: 'month', from: true, highlight: false, publish: false,
      blurb: 'Supermarkets & enterprise, + per-branch.', cta: 'Talk to us' },
  ],
} as const;
