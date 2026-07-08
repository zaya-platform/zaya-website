import { defineConfig } from 'astro/config';

// GO-LIVE (zaya.app final, 2026-07-08): canonical host pinned to zaya.app so all
// canonical + OG URLs match the public domain (override with SITE_URL if ever needed).
export default defineConfig({
  site: process.env.SITE_URL || 'https://zaya.app',
  // English-only for now (F3): localization DEFERRED; re-add the i18n block when
  // verified am/om/ti translations land — content is already structured for it.
  // @astrojs/sitemap 3.2 crashes on this build ("reduce of undefined"), so a STATIC
  // sitemap is shipped in public/ (sitemap-index.xml + sitemap-0.xml). Regenerate it
  // when adding pages, or re-enable the plugin once a compatible version is available.
  integrations: [],
  build: { inlineStylesheets: 'auto' },
  // Static-first, zero backend (Part 0). No server adapter, no SSR.
});
