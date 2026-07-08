// Founder-signed merchant tiers (Part 8). Edit here (or via the CMS) — no code
// change needed to update prices. Currency is ETB; customers use ZAYA free.
export const pricing = {
  currency: 'ETB',
  discounts: { sixMonth: 0.05, annual: 0.10 }, // ~5% / ~10% off (display copy reads from here)
  note: 'No hidden fees. Customers use ZAYA free.',
  tiers: [
    { id: 'free',    name: 'Free',        price: 0,   period: 'forever',  highlight: false,
      blurb: 'Everything a small shop needs to start.', cta: 'Start free' },
    { id: 'starter', name: 'Starter',     price: 199, period: 'month',    highlight: false,
      blurb: 'For growing shops that want more.',       cta: 'Choose Starter' },
    { id: 'pro',     name: 'Pro',         price: 299, period: 'month',    highlight: true,
      blurb: 'The full toolkit for a busy shop.',       cta: 'Choose Pro' },
    { id: 'premium', name: 'Premium Max', price: 999, period: 'month', from: true, highlight: false,
      blurb: 'Supermarkets & enterprise, + per-branch.', cta: 'Talk to us' },
  ],
} as const;
