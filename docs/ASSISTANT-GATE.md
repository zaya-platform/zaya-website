# The assistant gate — design, limits, and how the founder previews it

**Founder ruling, 2026-08-20.** Publishing the website and exposing the AI
assistant are two different decisions. Until this change they shared one flag
and the assistant shipped on every build, and the relay behind it answered
anyone on the internet. This document is the design, its honest limits, and the
phone-followable recipe for the founder's preview (W-D4a).

---

## 1. What was actually wrong (measured, not assumed)

Each of these was verified on `origin/main` @ `33adde5` before anything was
changed:

| # | Finding | Evidence |
|---|---|---|
| 1 | `src/layouts/Base.astro:56` mounted `<AssistantWidget />` **bare** | build at `published:false` shipped `zassist` **2× in every page's HTML**, plus **85 occurrences in `dist/_astro/index.*.css`** and **13 in `dist/_astro/hoisted.*.js`** |
| 2 | `Base.astro:17 const noindex = !site.published` was the publish flag's only consumer | one flag drove indexing; nothing drove the assistant |
| 3 | `netlify/functions/assistant/assistant.mjs` had **no auth, no token, no Origin check, no allowlist**, and never read any flag | the handler's first statement was `if (event.httpMethod !== 'POST')`; `netlify.toml` routes `/api/assistant` to it. **The endpoint was open.** |
| 4 | `src/config/site.ts` declared its own `published:false` with **zero importers** | `git grep "config/site"` → no hits |
| 5 | `netlify.toml [context.production]` ran `npm run build:draft`, which skips `scripts/check-publish.mjs` | a draft build at `published:true` emits **zero** `noindex` tags with no check having run |
| 6 | `public/robots.txt` was static | it said `Disallow: /` no matter what `published` said |

Finding 3 is why this was done now rather than queued behind the design work:
it was a live exposure, not a tidiness problem. This work branches off `main`,
not off the design line, for the same reason.

---

## 2. The design

### Two switches, neither of which can see the other

```
PUBLISH  src/content/data/site.json  "published"
         └─ consumers: src/layouts/Base.astro (robots meta)
                       src/pages/robots.txt.ts (generated /robots.txt)
                       scripts/check-publish.mjs (the F4 gate)

ASSISTANT src/config/assistant.json  "enabled" + "publicLaunchApproved"
          env ZAYA_ASSISTANT (on|off) + ZAYA_ASSISTANT_TOKEN (the shared secret)
         └─ consumers: src/config/assistant.mjs      (the pure resolver)
                       src/config/assistant-state.mjs (reads the file, calls it)
                       src/layouts/Base.astro         (mount or do not mount)
                       src/pages/index.astro          (the two other entry points)
                       netlify/functions/assistant/guard.mjs (the relay's gate)
                       scripts/check-publish.mjs      (asserts, never couples)
```

`scripts/test-assistant-gate.mjs` asserts this separation mechanically: it
strips comments from each assistant-side module and fails if the *code* so much
as mentions `site.json` / `site.published` / a `published:` key — and fails if
the generated `robots.txt` route mentions the assistant.

### Resolution rules (`src/config/assistant.mjs`)

In order, first match wins, and **every unclear case is OFF**:

1. `ZAYA_ASSISTANT=off` → **off**. A kill switch beats everything, including a
   committed `enabled:true`.
2. `ZAYA_ASSISTANT` set to anything that is not exactly `on`/`off` (`true`,
   `1`, `yes`, `onn`) → **off**. It refuses to guess.
3. `ZAYA_ASSISTANT=on` → on, *subject to rule 5*. This is how the founder's
   preview is armed on one deploy context with no commit and no effect on
   production.
4. No env switch → the committed `assistant.json` `enabled`, and **only the
   strict boolean `true`** counts (`"true"`, `1`, `"yes"` are all off).
5. No usable `ZAYA_ASSISTANT_TOKEN` (≥ 24 chars of `A–Z a–z 0–9 _ -`) → **off**,
   whatever the rest said. A widget without the secret could only collect 401s,
   so shipping its markup would be exposure with no function.

Missing, empty, truncated or non-object `assistant.json` → off, and the build
still succeeds. (That is why the file is *read and parsed* rather than
`import`ed: a JSON import turns a typo into a build crash, and the ruling asked
for *off*.)

### Why "off" means gone, not hidden

Astro hoists a component's `<style>`/`<script>` into the **page** bundles based
on the import graph, not on whether it rendered. A conditional mount alone
still shipped 98 `zassist` occurrences into `dist/_astro/*` — **and the hoisted
script then ran on every page and threw**, because `const root =
document.getElementById('zassist')` returned `null` and the next line read
`root.dataset`. So the widget's style and script are `is:inline`: they are
emitted only where the component renders. Off ⇒ `dist/**` contains **zero**
assistant bytes in HTML or JS.

Cost, stated: when the assistant IS on, that CSS/JS is unbundled, unminified
and repeated on every page: `dist/index.html` measures **28,675 B off vs
47,420 B on — +18,745 B per page**. It only ever
ships on a build that has the assistant on — today, only the preview.

### The relay's gate (`netlify/functions/assistant/`)

The handler's **first** action, before method checks, body parsing or rate
limiting:

- `ZAYA_ASSISTANT_TOKEN` not configured (or `ZAYA_ASSISTANT=off`) → **`503`**
  to everybody, identically, with no probing signal.
- Configured but the request does not carry the exact secret in
  `x-zaya-assistant-token` → **`401`**. Compared with `timingSafeEqual` over
  SHA-256 digests, so neither length nor prefix leaks.
- Correct secret → the existing curated cascade runs unchanged.

The relay reads **only the environment**. It cannot see `site.json` and never
should: publishing the site must not open it, and previewing it must not
publish the site.

### What this defends against — and what it does not

**It stops:** crawlers, scanners and drive-by bots that find `/api/assistant`;
cost abuse by anyone who has not loaded the one deploy that carries the widget;
and any accidentally-enabled deploy, which is 503 rather than open because no
secret is configured there.

**It does not stop — say it plainly:**

- **Anyone who can load a page that ships the widget can read the token.** It
  is a build-time string in that page's HTML (`data-auth`). "View source" is
  the whole attack. This is a shared secret for one unadvertised deploy, **not
  authentication**: there is no user, no session, no identity, and no way to
  tell two holders of the token apart.
- **Replay**: a captured request can be replayed verbatim until the token is
  rotated. Nothing is nonced, timestamped or client-bound.
- **An `Origin`/`Referer` check would add nothing** — both are attacker-set
  headers that `curl` supplies freely. That is exactly why one is not used as
  the gate.
- **Rate limiting is still per warm lambda instance** (unchanged, see
  `guard.mjs`). The token narrows *who* can spend; it does not make the spend
  cap global.

**The residual, stated:** the real protection for the preview is that its URL
is unadvertised and it is the only build carrying the token. If that URL
spreads, the token spreads with it.

Anything stronger — per-user login, Netlify password protection, a signed
short-lived token — is a W-D4b (public launch) decision, not something this
change could deliver honestly without an identity system the website does not
have.

---

## 3. For the founder — your preview, in plain steps

**What changed for you:** the AI chat button is now **switched off on the live
parked site**. That is deliberate: it used to be reachable by anyone on the
internet who knew the address of the answering service. Your own preview still
exists — it just needs turning on once, below. Until you do steps 1–3, **there
is no assistant preview**. That is a real, temporary loss and it is worth
saying rather than pretending otherwise.

### Turning your preview on (about 5 minutes, all on the phone)

1. **Make a secret.** It is just a long random word. On your phone, open a
   password manager (or notes app) and make a password of **at least 24
   characters** using only letters, numbers, `-` and `_` — no spaces, no
   punctuation. Example shape (do **not** use this one):
   `k7Tq-2ZmR9xLb4Vn8Pj3Wd6Y`. **Save it in your password manager.**

2. **Give it to Netlify.**
   - Open **netlify.com** → sign in → the **zaya-website** site.
   - **Site configuration** → **Environment variables** → **Add a variable**.
   - Key: `ZAYA_ASSISTANT_TOKEN`
   - Value: the secret you just made.
   - Scope: choose **Branch deploys** (not Production).
   - Save.

3. **Ask for the preview branch.** Tell your developer: *"create the
   `preview/assistant` branch"*. It is one command and it needs no code change —
   `netlify.toml` already tells that branch, and only that branch, to build with
   the assistant on.

4. **Open it.** Netlify → **Deploys** → find the deploy labelled
   `preview/assistant` → tap **Preview**. The address looks like
   `https://preview-assistant--zayaethiopia.netlify.app`. **Bookmark it.**
   The teal chat button is bottom-right, as before.

### Things worth knowing

- **The main address has no assistant at all** — not hidden, not disabled:
  absent. That is the point.
- **Treat the preview link like the secret itself.** Anyone you send it to can
  open the page, read the token out of it, and call the answering service
  directly. Send it to nobody you would not hand the secret to.
- **If the link leaks** (forwarded, posted, screenshotted with the URL bar):
  go back to Netlify → Environment variables → `ZAYA_ASSISTANT_TOKEN` → change
  the value to a **new** long random word → save → **Deploys → Trigger deploy**.
  Every old copy of the link stops working the moment the new build finishes.
  Nothing else needs doing and nothing is lost.
- **To switch the preview off entirely:** delete the `ZAYA_ASSISTANT_TOKEN`
  variable. The chat button disappears from the next build and the answering
  service refuses everyone.
- **Going public is still your decision (W-D4b).** It is not an environment
  variable: it takes a commit setting both `enabled` and `publicLaunchApproved`
  to `true` in `src/config/assistant.json`. The publish gate **refuses to build
  a published site** with the assistant on and `publicLaunchApproved` still
  false, and it says so in the deploy log.

---

## 4. What else changed with it

- **Finding 5 is closed from the draft side, not the production side.**
  This branch originally switched `netlify.toml [context.production]` to
  `npm run build`. That was reverted when the branch was merged to `main`
  (2026-08-20), because `npm run build` exits 1 while `published:false`, so it
  would have failed **every** production deploy — freezing the founder's live
  preview at `zayaethiopia.netlify.app` on its last successful build and
  silently detaching it from `main`. The hole was real; that was the wrong end
  of it.
  Instead, **`build:draft` now runs `scripts/check-draft.mjs`**, which refuses
  to build when `published:true`. The two guards are exhaustive over the flag:
  `published:false` → only `build:draft` succeeds (noindex + `Disallow` by
  construction); `published:true` → only `build` succeeds (full publish gate
  ran). **No build path can produce an indexable site without the full gate
  passing**, and the parked preview keeps deploying on every push to `main`.
- **`/robots.txt` is generated** by `src/pages/robots.txt.ts` from the same
  `site.json` flag as the `<head>` robots meta; the static `public/robots.txt`
  is deleted (a file in `public/` shadows a route of the same name). One
  switch, not two. No `Sitemap:` line, because `@astrojs/sitemap` is currently
  disabled in `astro.config.mjs` and advertising a 404 would be a lie.
- **`src/config/site.ts` is deleted.** It had zero importers and a second copy
  of `published`. `src/content/data/site.json` stays the single source: it is
  the one `Base.astro` and the gate already read, and it is JSON that a
  non-technical editor can change.
- **The publish gate now asserts the assistant** (see §2) and also refuses a
  publish build if `public/robots.txt` or a `published:`-carrying
  `src/config/site.ts` ever comes back.
- **`src/pages/index.astro`** had two more assistant entry points — the nav
  "Ask ZAYA AI" button and the whole "ask-band" section — both driven by
  `data-open-assistant`, whose handler ships inside the widget. Gated off with
  it; otherwise they were dead buttons and a promise the page could not keep.

### Known residue, honestly

`src/styles/site.css` still carries the `.ask-band` / `.ask-band-in` /
`.ask-orb` / `.menu-ai` rules (15 matches in the 41,193-B built stylesheet) when the
assistant is off. They are **CSS, not markup** — nothing on the page uses them
and nothing is exposed by them — and they must stay, because those classes
belong to the page, not the widget, and are needed the moment the assistant is
switched back on. Deleting them would also collide with the design pass in
flight on `design/system-pass-2026-08-19`.
