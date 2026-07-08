import { defineConfig } from 'astro/config';
// import sitemap from '@astrojs/sitemap';

// Canonical URL is CONFIG-DRIVEN so it works on the free Netlify subdomain now and
// swaps to zayaethiopia.com later with zero rework: Netlify sets $URL to the site's primary
// address (subdomain, then the custom domain once added), so canonical links + OG
// tags follow automatically. Falls back to zayaethiopia.com for local builds. (F2)
export default defineConfig({
  site: process.env.URL || process.env.SITE_URL || 'https://zayaethiopia.com',
  // English-only for now (founder ruling 2026-07-08): localization is DEFERRED to
  // a later phase (draft am/om/ti needed native-speaker quality work). The single-
  // locale i18n block was removed because it tripped @astrojs/sitemap; re-add
  // `i18n: { defaultLocale, locales, routing }` here + the selector when verified
  // translations land — content is already structured for it.
  // sitemap() temporarily disabled: @astrojs/sitemap 3.2 crashes on this build
  // ("reduce of undefined"). Re-enable at publish (bump the plugin / pass an
  // explicit `serialize`); the site is noindex until published anyway (F4).
  integrations: [],
  build: { inlineStylesheets: 'auto' },
  // Static-first, zero backend (Part 0). No server adapter, no SSR.
});
