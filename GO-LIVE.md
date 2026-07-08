# ZAYA website — GO-LIVE guide (your steps)

Everything is built, wired, and already on GitHub at **github.com/zaya-platform/zaya-website**
(private). Below is exactly what *you* click. Nothing here needs coding.

There are 4 steps. You can do **Steps 1–2 now** (free subdomain); **Steps 3–4** when your
lawyer and the zayaethiopia.com domain are ready.

---

## Step 1 — Put the site online (free Netlify) · ~10 min
1. Go to **netlify.com** → **Sign up** → choose **“Sign up with GitHub”** (use the GitHub
   account that owns the repo).
2. **Add new site → Import an existing project → GitHub →** pick **`zaya-website`**.
3. Netlify reads the build settings automatically (from `netlify.toml`). Click **Deploy**.
4. In about a minute you get a live address like **`something.netlify.app`**.
   *(It is hidden from Google until Step 4 — that is on purpose.)*
5. *(Optional)* **Site settings → Change site name** to make the address nicer,
   e.g. `zaya-app.netlify.app`. **Write this address down** — you need it in Step 2.

## Step 2 — Turn on admin editing (staff log in with GitHub) · ~10 min
Your content editor lives at **`your-address/admin`**. To switch on the login:

1. **Create a GitHub login app (one time).** On GitHub: click your photo →
   **Settings → Developer settings → OAuth Apps → New OAuth App**. Fill in:
   - **Application name:** `ZAYA Website Editor`
   - **Homepage URL:** your Netlify address (from Step 1)
   - **Authorization callback URL:** your Netlify address **+ `/callback`**
     (e.g. `https://zaya-app.netlify.app/callback`)
   - Click **Register application** → copy the **Client ID** → click **Generate a new
     client secret** → copy the **Client Secret**.
2. **Give those to Netlify.** Netlify → your site → **Site configuration → Environment
   variables → Add**, twice:
   - `GITHUB_CLIENT_ID` = the Client ID
   - `GITHUB_CLIENT_SECRET` = the Client Secret
3. **Tell the editor your address.** On GitHub, open the file
   **`public/admin/config.yml`**, click the ✏️ pencil, change the line
   `base_url: https://YOUR-SITE.netlify.app` to your real address, and **Commit**.
   *(Or just tell me your address and I’ll set it.)*
4. **Invite your staff.** GitHub → the `zaya-website` repo → **Settings → Collaborators →
   Add people** → their GitHub username → **Write** access.
   They can now open **`your-address/admin`**, click **Login with GitHub**, and edit
   pricing, contact details, FAQ, blog posts, testimonials, etc. Their changes save
   themselves and the site updates in a minute. No coding, no separate password system.

## Step 3 — Add the legal pages (required before going public)
We built a safety rule: the site **refuses to go public** until real Privacy + Terms exist.
1. Have your lawyer finalize **Privacy Policy** and **Terms**. Starter drafts are in the
   repo at **`docs/legal-drafts/`**.
2. The final text goes in two files: `src/content/legal/privacy.md` and
   `src/content/legal/terms.md`. **Send me the final wording and I’ll add them**, or an
   editor can.

## Step 4 — Your domain + going live
1. **Domain:** once **zayaethiopia.com** is registered, Netlify → **Domain settings → Add a domain →**
   `zayaethiopia.com`, and follow the DNS instructions it shows. The whole site switches to zayaethiopia.com
   automatically — nothing to rebuild.
2. **Go live:** on GitHub, open **`src/content/data/site.json`** and change
   `"published": false` → `"published": true`, and open **`public/robots.txt`** and change
   `Disallow: /` → `Allow: /`. Commit both. *(Tell me and I’ll do this in one step.)*
3. Netlify redeploys — the site is now **public and visible on Google** at zayaethiopia.com.

---

### What’s already done for you (no action needed)
Netlify config · Netlify Forms “Join the pilot” form (submissions appear under
**Netlify → Forms**) · Sveltia CMS + GitHub login (no deprecated Netlify Identity) ·
self-hosted fonts · works on the free subdomain now and swaps to zayaethiopia.com with zero rework ·
the noindex + publish safety gate · the private GitHub repo.

### Still needed from you
zayaethiopia.com registration · final Privacy/Terms wording · confirmed/commissioned photos
(the current ones are marked placeholders). When those land, going live is Steps 3–4 above.
