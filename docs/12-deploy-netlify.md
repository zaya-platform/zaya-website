# 12 · Deploy to Netlify + admin login (Sveltia CMS)

Host: **Netlify** (best fit for a static Astro site + the Git-based CMS). Domain: **zaya.app**.
Admin login: **Sveltia CMS + GitHub OAuth** — a maintained path that replaces the
**deprecated Netlify Identity** (Sveltia is a drop-in for Decap; same `config.yml`).

---

## A. Put the site on GitHub
1. Create a repo, e.g. **`zaya-platform/zaya-website`** (separate from the platform monorepo).
2. Push this folder to it (`main` branch).
3. In `public/admin/config.yml`, set `backend.repo` to that exact `owner/repo`.

## B. Connect Netlify
1. Netlify → **Add new site → Import from Git** → pick the repo.
2. Build settings come from **`netlify.toml`** (no manual entry needed):
   - Branch/preview deploys run `npm run build:draft` → a **noindex draft** (safe to share for review + CMS testing).
   - The **production** context runs `npm run build` → the **F4 gate**, which *fails the deploy* until Privacy/Terms exist, photo rights are cleared, and `published:true`. So the public site can't go live prematurely.
3. Add the custom domain **zaya.app** (Netlify DNS or your registrar) once registered.

## C. Admin login — GitHub OAuth (no Netlify Identity)
Editors sign in with a **GitHub account that has write access to the website repo** — this is
**separate from ZAYA platform auth**. Sveltia needs a tiny OAuth relay (client secret can't live
in the browser):
1. **GitHub → Settings → Developer settings → OAuth Apps → New**:
   - Homepage URL: `https://zaya.app`
   - Authorization callback URL: your relay's `/callback` (from step 2).
   - Copy the **Client ID** + **Client Secret**.
2. Deploy the free **`sveltia-cms-auth`** Cloudflare Worker (maintained by the Sveltia author):
   - Set its `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `ALLOWED_DOMAINS=zaya.app`.
   - It gives you a URL like `https://zaya-auth.<you>.workers.dev`.
3. In `config.yml` set `backend.base_url` to that Worker URL.
4. **Invite editors** = add them as **collaborators** (write) on the GitHub repo. They visit
   `https://zaya.app/admin`, sign in with GitHub, and edit via the draft → review → publish workflow.
   Their saves commit to the repo → Netlify rebuilds → the site updates. No new database.

> Alternative (also fine): keep **Decap CMS** with the same GitHub backend + the same OAuth relay.
> Sveltia is recommended purely because it's actively maintained and faster.

## D. Pin the CMS version (stability)
`public/admin/index.html` loads Sveltia from a CDN. Before go-live, pin an exact version, e.g.
`https://cdn.jsdelivr.net/npm/@sveltia/cms@X.Y.Z/dist/sveltia-cms.js`.

---

## Go-live checklist (flip from draft → public)
The production build **will not pass** until every item is done — by design (F4).
- [ ] **Privacy + Terms**: add real `src/content/legal/privacy.md` and `terms.md` (≥ real content, no "placeholder").
- [ ] **Photos**: confirm commercial rights → set `src/assets/photos/_rights.json → cleared:true`, **or** replace with commissioned pilot-shop photos (same filenames). Remove any `*_rights-pending*` files.
- [ ] **Form**: set `contact.json`/`contact.formEndpoint` to your Formspree (or Netlify Forms) endpoint.
- [ ] **Admin**: OAuth relay live, `base_url`+`repo` set, editors invited.
- [ ] **Sitemap**: re-enable `@astrojs/sitemap` in `astro.config.mjs` (bump the plugin to a version compatible with Astro 4).
- [ ] **robots.txt**: switch `public/robots.txt` from `Disallow: /` to `Allow: /` + the sitemap line.
- [ ] Flip **`src/content/data/site.json → published:true`** (lifts noindex + passes the gate).
- [ ] Push → Netlify production deploy goes green and the site is live at zaya.app.

## Pending founder inputs (then go-live is one short step)
zaya.app registration · real Privacy/Terms · Formspree endpoint · cleared/commissioned photos.
Everything else is prepared and wired.
