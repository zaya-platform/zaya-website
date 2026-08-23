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
   - The **production** context also runs `npm run build:draft` **while the site is parked** (`published:false`), so the free `*.netlify.app` preview keeps deploying. `build:draft` is itself guarded: `scripts/check-draft.mjs` *fails the build* if `published:true`, so a draft build can never emit an indexable site.
   - At go-live, `[context.production]` switches to `npm run build` → the **F4 gate**, which *fails the deploy* until Privacy/Terms exist, photo rights are cleared, the assistant's state is asserted, and `published:true`. So the public site can't go live prematurely.
3. Add the custom domain **zaya.app** (Netlify DNS or your registrar) once registered.

## C. Admin login — GitHub OAuth (no Netlify Identity)
Editors sign in with a **GitHub account that has write access to the website repo** — this is
**separate from ZAYA platform auth**. Sveltia needs a tiny OAuth relay (client secret can't live
in the browser):
1. **GitHub → Settings → Developer settings → OAuth Apps → New**:
   - Homepage URL: `https://zaya.app`
   - Authorization callback URL: your relay's `/callback` (from step 2).
   - Callback URL: `https://<your-netlify-site>/callback`. Copy the **Client ID** + **Client Secret**.
2. The OAuth relay is **already in this repo** as Netlify Functions (`netlify/functions/auth.mjs`
   + `callback.mjs`, sharing `netlify/oauth-shared.mjs`, routed via `netlify.toml`) —
   **no Cloudflare/Netlify-Identity needed**.
   In Netlify → Site configuration → Environment variables, add `GITHUB_CLIENT_ID` and
   `GITHUB_CLIENT_SECRET`.
3. In `public/admin/config.yml` set `backend.base_url` to your Netlify site URL.

### C1. How the relay protects the token (P1c, 2026-08-23)
The relay hands the browser a GitHub token that can **rewrite this repo**, so it is fussy
about who gets it. Two rules, both proved by `npm run test:oauth` — no deploy needed:

- **Origin allowlist.** The callback popup releases the token only to an origin this deploy
  vouches for: *this deploy's own origin*, plus Netlify's `URL` / `DEPLOY_PRIME_URL` /
  `DEPLOY_URL`, plus anything listed in `CMS_ALLOWED_ORIGINS`, plus deploy aliases of the
  **same** Netlify site (`<branch>--<site>.netlify.app`). Anything else is refused and the
  popup says so. **Why the alias rule exists:** `config.yml` pins `base_url` to one host, so
  a branch deploy's `/admin` (on `preview-assistant--zayaethiopia.netlify.app`) opens the
  relay on the **production** host — a plain same-origin check would break CMS login on every
  preview. Set `CMS_ALLOW_DEPLOY_PREVIEWS=false` to drop the alias rule if previews stop
  mattering.
- **CSRF `state`.** `/auth` mints 256 CSPRNG bits and parks a copy in an
  `HttpOnly; Secure; SameSite=Lax` cookie scoped to the relay's own host; `/callback` refuses
  unless GitHub's echoed `state` matches that cookie, then burns it. Lax is deliberate: the
  cookie still rides GitHub's top-level redirect back, but never a cross-site subresource.

**Environment variables (all optional — the defaults are the safe ones):**

| Variable | Default | Use it when |
|---|---|---|
| `CMS_ALLOWED_ORIGINS` | *(empty)* | You edit from a host the deploy can't infer (apex **and** `www`, a staging domain). Comma-separated full origins. |
| `CMS_ALLOW_DEPLOY_PREVIEWS` | on | Set to `false` to refuse `<branch>--<site>.netlify.app` openers. |
| `GITHUB_OAUTH_SCOPE` | `public_repo,user:email` | The website repo is **public**, so `public_repo` is enough and full `repo` (every private repo the editor can reach) is not. **If this repo is ever made private, set `repo,user:email` or CMS saves start failing.** Narrowing only takes effect for *new* authorizations — an editor who already granted `repo` keeps it until they revoke the app at github.com/settings/applications. |
4. **Invite editors** = add them as **collaborators** (write) on the GitHub repo. They visit
   `/admin`, sign in with GitHub, and edit via the draft → review → publish workflow.
   Their saves commit to the repo → Netlify rebuilds → the site updates. No new database.
   *(Non-technical, step-by-step version: **GO-LIVE.md**.)*

> Alternative (also fine): keep **Decap CMS** with the same GitHub backend + the same OAuth relay.
> Sveltia is recommended purely because it's actively maintained and faster.

## D. The CMS bundle is pinned **and** hash-checked (done, 2026-08-23)
`public/admin/index.html` loads Sveltia from jsDelivr. It used to load the *unversioned* tag,
so every visit ran whatever the CDN served at that moment — in a tab holding a repo-write
GitHub token. It is now pinned to **`@sveltia/cms@0.196.0`** with a **subresource-integrity**
hash, so the browser runs that exact file or nothing at all:

```
sha384-CAkV2ok/JoSJwP/CCrXGYho2VRacSfJ93JUAftvaq7ACeWeVxXpnFrSGE2hpNeKC
```

That hash was computed from the real 1,967,464-byte asset and confirmed byte-identical from
jsDelivr **and** unpkg independently. `crossorigin="anonymous"` is required — without it the
browser silently skips the integrity check.

**Upgrading — move the version and the hash together, never one alone:**
```bash
curl -sSL https://cdn.jsdelivr.net/npm/@sveltia/cms@<NEW>/dist/sveltia-cms.js -o /tmp/cms.js
node -e "const c=require('crypto'),f=require('fs');console.log('sha384-'+c.createHash('sha384').update(f.readFileSync('/tmp/cms.js')).digest('base64'))"
npm run test:oauth   # asserts the tag is pinned and the hash is real
```
A version/hash mismatch means the editor does not load at all. That is the intended
failure mode, not a bug.

**Residual, stated plainly:** SRI covers the entry bundle only. Once running, Sveltia
*dynamically imports* optional extras — Shiki syntax highlighting and PDF.js preview — from
`unpkg.com` at their own pinned versions. `import()` cannot carry an integrity hash, so those
are pinned upstream but not hash-checked here, and they execute in the same token-bearing
session. Closing that needs either a self-hosted CMS bundle or an `/admin` Content-Security-
Policy restricting `script-src`/`connect-src` to the CDN hosts — a bigger change than a pin,
and untested against the CMS, so it is written down rather than done.

---

## Go-live checklist (flip from draft → public)
The gated build **will not pass** until every item is done — by design (F4).
Note what is and is not true today: while the site is parked, `[context.production]`
runs `npm run build:draft`, so the F4 gate does **not** run on production deploys —
it has nothing to protect, because a draft build is noindex by construction and
`scripts/check-draft.mjs` refuses to run at `published:true`. The gate starts
running on production the moment the last item below is done, because that flip and
the switch to `npm run build` must happen in the same change (either alone fails the
build on purpose).
- [ ] **Privacy + Terms**: add real `src/content/legal/privacy.md` and `terms.md` (≥ real content, no "placeholder").
- [ ] **Photos**: confirm commercial rights → set `src/assets/photos/_rights.json → cleared:true`, **or** replace with commissioned pilot-shop photos (same filenames). Remove any `*_rights-pending*` files.
- [ ] **Form**: set `contact.json`/`contact.formEndpoint` to your Formspree (or Netlify Forms) endpoint.
- [ ] **Admin**: OAuth relay live, `base_url`+`repo` set, editors invited.
- [ ] **Sitemap**: re-enable `@astrojs/sitemap` in `astro.config.mjs` (bump the plugin to a version compatible with Astro 4).
- [x] ~~**robots.txt**: switch `public/robots.txt`~~ — no longer a step. `/robots.txt` is GENERATED by `src/pages/robots.txt.ts` from `site.json published`, so it flips with the flag (the static `public/robots.txt` was deleted 2026-08-20 — a file in `public/` shadows a route of the same name). Add the `Sitemap:` line **in that route** when `@astrojs/sitemap` is re-enabled.
- [ ] **Assistant**: decide W-D4b. The AI assistant is OFF by default and gated separately (`src/config/assistant.json`); a publish build **fails** if it is on without `publicLaunchApproved:true`. See `docs/ASSISTANT-GATE.md`.
- [ ] Flip **`src/content/data/site.json → published:true`** (lifts noindex + passes the gate).
- [ ] Push → Netlify production deploy goes green and the site is live at zaya.app.

## Pending founder inputs (then go-live is one short step)
zaya.app registration · real Privacy/Terms · Formspree endpoint · cleared/commissioned photos.
Everything else is prepared and wired.
