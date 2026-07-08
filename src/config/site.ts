// Site-wide config (F2 domain ruling). Non-technical-editable via the CMS.
export const site = {
  name: 'ZAYA',
  tagline: 'Everything near you.',
  url: 'https://zaya.app', // F2 — canonical host
  portalUrl: 'https://app.zaya.app', // Sign-In / role links target this (coming-soon)
  defaultLocale: 'en',
  // English-only for now (founder ruling 2026-07-08): the draft am/om/ti
  // translations need native-speaker quality work, so the language selector is
  // removed and localization is DEFERRED to a later phase. The i18n structure
  // stays ready — re-add 'am','om','ti' here + the selector when verified
  // translations land. The ZAYA APP still supports all four; this is the website.
  locales: ['en'] as const,
  // F4 BINDING publish gate: the site stays noindex + is not built for production
  // until real Privacy + Terms exist and this is flipped true. robots.txt and the
  // <head> robots meta read this; a prebuild check refuses a publish build otherwise.
  published: false,
} as const;
