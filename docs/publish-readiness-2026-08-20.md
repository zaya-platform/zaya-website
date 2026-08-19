# ZAYA website — publish readiness

**Prepared 20 August 2026 · measured against branch `design/system-pass-2026-08-19` @ `ce454e1`**

---

## Read this first

**Nothing in this document publishes anything.** Writing it changed no setting, no
domain and no server.

`src/content/data/site.json` still reads `"published": false` — untouched. That one word
is the switch. I ran the repo's own publish gate just now; here is its **exact, current
output**:

```
✖ publish gate: site.json published is false — not cleared to publish yet.
  (use "npm run build:draft" for a noindex preview build)
```

Flipping that word to `true` is **the founder's act, and nobody else's**. It is also
**irreversible in practice**: the moment search engines are allowed in, they copy the
pages, and those copies live in caches, indexes, screenshots and other people's archives.
You can take a page down; you cannot take it *back*.

Everything below is what stands between today and that flip.

---

# ⛔ BLOCKER — read before anything else

## The AI assistant chat has no on/off switch, and it is on every page

The assistant widget in the bottom corner of the site was built as a **founder-access
preview**. The code says so in three separate places. The plan was that a *second*
gate — a public-launch decision — would happen before real visitors could use it.

**That second gate does not exist in the code.** I looked for it in every form it could
take, and found none:

| Where a switch could live | Is there one? |
|---|---|
| A condition around the widget in the page layout | **No** — `src/layouts/Base.astro:56` mounts it unconditionally |
| An on/off setting the build reads | **No** — `src/config/site.ts` has one, but nothing imports that file; it is dead code |
| An environment variable on the host | **No** — none anywhere in `src/` |
| A per-page rule | **No** — all three pages use the same layout, so all three carry it |
| CSS that hides it | **No** |

I confirmed it in the built output, not just the source: the widget appears in
**`/`, `/privacy/` and `/terms/`** in the actual `dist/` folder the build produces.

**Why this blocks.** Today the site is hidden from Google, so the assistant sees almost
no traffic. Publishing invites the public in — and the assistant then becomes a public
feature it was never cleared to be. Its own code notes the shortfall: its abuse limit
counts requests **per running server instance, not globally**, which the code itself
calls "a real brake for an unadvertised parked site" and flags a proper shared limiter
as a *public-launch* item. That item was never done.

**What "done" looks like:** either (a) a real switch is added so the assistant can be
turned off independently of publishing, and it launches on its own decision later; or
(b) the founder consciously decides the assistant launches *with* the site, and the
public-launch items (shared rate limit, counsel sign-off on the data path below) are
completed first. **Doing nothing is the same as choosing (b) by accident.**

---

# A · FOUNDER ACTS — only you can do these

### A1 · Buy the domain `zayaethiopia.com`

**What it is.** Register the domain and keep the login details. Nothing else about the
site can be finished first.

**Why it blocks.** Every address in the site points at `zayaethiopia.com` — the
canonical link on each page, the social-share tags, and three redirect rules in
`netlify.toml` that forward `zaya.et`, `www.zaya.et` and `zaya.com.et` to it. None of
that can be tested, and no DNS can be configured, until the name exists. The
content-editor login (`public/admin/config.yml`) also still points at a `.netlify.app`
address and has to be repointed after the domain is connected.

**Done looks like:** you hold the registrar account for `zayaethiopia.com`, and can log
into it to change DNS records.

*(Optional, separate: `zaya.et` / `zaya.com.et` go through Ethio Telecom / the .et
registry. The redirect rules are already written for them, but they are dormant and
harmless until those names are registered. `.et` registration must permit pointing DNS
at an outside host — confirm that before relying on it.)*

### A2 · The Ethiopian counsel review — recorded as BLOCKING

**What it is.** A qualified Ethiopian lawyer reviews the live Privacy Policy and Terms
against the **Personal Data Protection Proclamation No. 1321/2024**, and confirms in
writing that they may be published.

**Why it blocks.** The current live texts (`src/content/legal/privacy.md`, 4,971
characters; `src/content/legal/terms.md`, 3,033 characters) pass the repo's automated
checks — I verified this by running the real gate. But those checks only test for
*placeholders*, not for *legal correctness*. The drafts they came from carry explicit
lawyer questions that were never formally answered, including:

> "Lawyer to confirm the lawful transfer basis under Proclamation 1321/2024."
> "Lawyer to align the rights and response timelines with Proclamation 1321/2024."

The moment you publish, those texts become a public promise to every visitor.

**Three things counsel must specifically be given:**

1. **The cross-border data path in the AI chat.** This is real, and here is exactly what
   it is. When a visitor types into the assistant, the text goes to your own server
   first. Most answers come straight from ZAYA's own written content and go **no
   further**. But for some **English** questions, the visitor's typed text is sent to
   **Google (Gemini), on servers outside Ethiopia**
   (`generativelanguage.googleapis.com`). Verified specifics:
   - It happens **only** when *all* of these are true: the question is in English, no
     Ethiopian script is present, it does not look like Afaan Oromoo, ZAYA's own content
     did not already answer it, the question is on-topic, **and** a Google API key is
     configured on the host.
   - Amharic, Afaan Oromoo and Tigrinya questions are **never** sent to Google.
   - Before sending, the code **strips e-mail addresses and things shaped like phone
     numbers**. It does **not** strip names, addresses, or anything else. A code comment
     claims "PII never travels further than this line" — that claim is stronger than what
     the code actually does, and counsel should be told the accurate version, not the
     comment.
   - No name, account or identity is attached to the message.
   - **Whether that Google key is actually configured on the host cannot be determined
     from this repository.** It lives in the hosting account's settings. Someone with
     access to the Netlify account must check and tell counsel the answer, because if the
     key is absent this cross-border transfer is not happening at all today.

   The published Privacy Policy already discloses this path honestly (Section 5a) and
   warns visitors not to type personal details into the chat. What is missing is
   counsel's confirmation that the disclosure *and the transfer itself* satisfy
   Proclamation 1321/2024.

2. **Retention.** The live policy commits to deleting contact details after 24 months.
   Counsel should confirm that is defensible.

3. **One accuracy gap I found.** The "Join the pilot" form on the homepage collects
   **name, phone, shop name and message**. The Privacy Policy's list of what you collect
   mentions name, phone, e-mail, role and message — it does **not** mention **shop
   name**, and it lists two fields the form does not have. For a sole trader a shop name
   can identify a person. Small, but it is the kind of mismatch a regulator reads first.

**Done looks like:** a written note from the lawyer saying the Privacy Policy and Terms —
including Section 5a, the assistant's data path — are cleared for publication, plus any
wording changes they require, merged into the two files.

### A3 · The explicit go

**What it is.** You, and only you, say the words: publish.

**Why it blocks.** Deliberately. The gate exists so that no engineer, no automated
process and no assistant can make this decision on your behalf.

**Done looks like:** A1 done, A2 signed off, Section B below complete, and you giving
the instruction in writing. Then `"published": false` becomes `"published": true` and
`public/robots.txt` is changed in the same commit (see C3 — they are two separate
switches, not one).

---

# B · ENGINEERING — what must be fixed or done first

Severity is stated honestly. Two items must be resolved before publish; the rest are
either blocked on you, or are configuration steps that only become possible after A1.

### Must be resolved before publish

**B1 · The assistant gate — BLOCKER.** See the red section at the top of this page. This
is the one item that is a genuine stop.

**B2 · The hero subheading changed size, and nothing said so — HIGH.** On the current
branch, the paragraph under the big headline stopped being a fixed 17px and became a
size that scales with the browser window. Verified in the code at both commits: it was
`font-size:17px` before, and is `font-size:var(--fs-lead)` — `clamp(16px, 1.50vw, 19px)`
— now. No commit message and no design note mentions it, and the branch's own headline
claim of "hero delta zero" is true only of the big headline, not of this paragraph.

Measurements from the review round that caught it (rendered in a browser at fixed widths;
I verified the code change myself but did not re-run the rendering): on a **1000px-wide
laptop or tablet** the subheading re-wraps from 4 lines to 3 and the hero block loses
**34.4px of height (-6.9%)**, which shifts the buttons underneath and breaks their
alignment against the graphic beside them. This is the same class of defect that sent
this branch back once already, and it is larger this time. The follow-on branch
(`design/component-pass-2026-08-20`) does **not** fix it — the line is still there.

**Why it matters for publishing:** this is the homepage, at the widths a large share of
Ethiopian laptop and tablet visitors use, and it will be the first thing indexed and
screenshotted. Fix it or ratify it deliberately — but do not publish it unexamined.

### Configuration and hygiene — do these before the flip

**B3 · The live build currently skips the safety gate — MEDIUM.** `netlify.toml` sets the
production build to `npm run build:draft`, which is the *ungated* build. This was a
deliberate temporary measure so the site could sit on the free address. But it means the
publish gate would **not run** on the real deploy. I measured this: with `published` set
to `true` in a throwaway copy, `build:draft` produced all three pages **with the
"do not index" tag removed** — a "draft" build is not a safe build; safety comes entirely
from the one flag in `site.json`. At go-live this line must be switched back to
`npm run build`. Note that **`GO-LIVE.md` Step 4 does not mention this step** even though
`netlify.toml` points at it — the instructions have a hole in them.

**B4 · Two different `published` flags exist — LOW, but confusing.** `src/config/site.ts`
declares `published: false` and is **never imported by anything**. The live one is
`src/content/data/site.json`. If someone ever flips the wrong file, nothing happens and
the mistake is invisible. Delete the dead one or wire it up.

**B5 · The site map is switched off, but `robots.txt` promises one — LOW.** The sitemap
plugin is commented out in `astro.config.mjs` (it was crashing the build). The
post-publish text sitting in `public/robots.txt` tells search engines to fetch
`https://zayaethiopia.com/sitemap-index.xml`, which the build does not produce. Either
get the plugin working again or delete that line before publishing — pointing crawlers at
a missing file is a poor first impression.

**B6 · The content editor loads code from the internet without a version pin — LOW/MEDIUM.**
`public/admin/index.html` pulls the Sveltia CMS editor from `cdn.jsdelivr.net` with **no
version number**, so it silently upgrades itself. The file's own comment says to pin the
version at deploy. That was never done. Pin it.

**B7 · The assistant's abuse limit is not global — MEDIUM, tied to B1.** Verified in the
code and openly admitted there: request counting happens per running server instance, so
neither the per-visitor limit nor the daily budget is truly enforced across the whole
site. Acceptable for a quiet preview; not acceptable for a public page. This is the
public-launch item that was deferred.

**B8 · The repo's own `npm run check` cannot run — LOW.** It asks to install a missing
dependency and stops. Worth fixing so pre-publish checks are actually runnable.

### DNS and hosting — NOT POSSIBLE YET (blocked on A1)

These steps cannot be started, let alone verified, until the domain is registered. Listing
them so the sequence is clear, not implying they are ready:

1. In the hosting account (Netlify), add `zayaethiopia.com` as a domain and set it as the
   **primary** domain.
2. At the registrar, point the domain's DNS at the host, using exactly the records the
   host displays. Allow up to 24–48 hours for propagation.
3. Confirm the HTTPS certificate has issued for both `zayaethiopia.com` and
   `www.zayaethiopia.com`. Do not proceed while the browser shows a certificate warning.
4. Update the content-editor address: `public/admin/config.yml` currently has
   `base_url: https://zayaethiopia.netlify.app` and must become the real domain, or staff
   logins to `/admin` will break.
5. If you also register `zaya.et` / `zaya.com.et`, add them as **secondary** domains on
   the same site — the forwarding rules for them are already written.

### Redirect and canonical-URL check — NOT POSSIBLE YET (blocked on A1 + DNS)

The site tells search engines its own official address on every page. Right now, built
locally, those read `https://zayaethiopia.com/`, `/privacy/` and `/terms/` — I verified
this in the build output. But on the host that address is taken from the host's own
primary-domain setting, so **until the custom domain is primary, every page will declare
the `.netlify.app` address as its official one.** Publishing in that state would tell
Google the wrong home.

Once the domain is live, check all of the following **before** the flip, and again after:

- `http://zayaethiopia.com` → redirects to `https://zayaethiopia.com` (one hop).
- `https://www.zayaethiopia.com` → redirects to `https://zayaethiopia.com` (one hop) —
  or the reverse, but **pick one and be consistent**.
- The old `*.netlify.app` address → redirects to the domain, so the two are never
  competing versions of the same site.
- Open `/`, `/privacy/` and `/terms/` and confirm each page's declared official address
  is the `zayaethiopia.com` one, and that the address it names matches the address in the
  browser bar.
- Confirm no redirect chains longer than one hop, and no redirect loops.
- If `zaya.et` / `zaya.com.et` are live, confirm each forwards to `zayaethiopia.com` and
  keeps the path.

---

# C · SAFETY — exactly what changes the moment you flip the switch

### C1 · The complete list of what becomes public

This is not an estimate. These are the files the build actually produced when I ran it,
counted and listed:

**Pages that become indexable by Google:**

| Address | What it is |
|---|---|
| `/` | The homepage — the full marketing page, including the pilot sign-up form |
| `/privacy/` | The Privacy Policy |
| `/terms/` | The Terms |

**Reachable, but keeps its own "do not index" instruction:**

| Address | What it is |
|---|---|
| `/admin/` | The staff content editor (Sveltia CMS). It has a hardcoded no-index tag of its own *and* a server header, both of which survive the flip — I verified this. It is still **openly reachable**, just not indexed. It requires a GitHub login to actually do anything. |
| `/admin/config.yml` | The editor's configuration, readable by anyone. It names the GitHub repository `zaya-platform/zaya-website` and the branch it writes to. No secrets, but it is public information. |

**Server endpoints (already reachable today; publishing drives traffic to them):**

| Address | What it is |
|---|---|
| `/api/assistant` | The AI chat relay — **see the blocker at the top of this page** |
| `/auth`, `/callback` | The GitHub login handshake for the content editor |

**Supporting files:** `/robots.txt`, `/favicon.svg`, `/og.png`, and 15 files under
`/_astro/` (the stylesheet, one script, 7 photographs, 6 font files). 23 files in total.

### C2 · What personal and business information goes public with it

- Your two phone numbers and `zayaapp@gmail.com` appear on the homepage and in the legal
  pages. Once indexed, expect scraping and spam.
- The "Join the pilot" form goes live and starts collecting **real names and real phone
  numbers** from strangers, into the host's form store. This is the moment the Privacy
  Policy stops being a document and starts being an obligation — which is why A2 comes
  first.
- The eight photographs on the site are AI-generated placeholders. The founder cleared
  them for commercial use on 8 July 2026, **including** an accepted trademark exposure
  (a Coca-Cola cooler in the storefront image, a Nestlé "Nido" pack in the customer-app
  image). That ruling was made for a pilot. It is worth re-confirming that it still
  holds for a *publicly indexed* site.

### C3 · Important: it is TWO switches, not one

I measured this. Flipping `published` to `true`:

- **Removes the "do not index" tag from all three pages at once.** There is no way to
  publish one page and hold another back — it is site-wide, immediately.
- **Does NOT change `public/robots.txt`.** A comment in that file says "a build step
  regenerates this" — **there is no such build step.** I searched the whole repository.
  The file still says `Disallow: /` and must be edited **by hand**, in the same commit.

If you flip only the flag: pages invite indexing while `robots.txt` blocks crawling —
Google may list bare URLs with no description. If you flip only `robots.txt`: crawlers
are let in and then told by each page not to index it. **Both must change together, or
neither.**

### C4 · The one surface that should not be public yet

**The AI assistant.** Not my opinion — the repository's own record. Three separate places
in the code describe it as a founder-access preview whose public launch is a *separate*
decision, and that decision is not implemented anywhere. Right now the ONLY thing holding
it back from public traffic is the fact that nobody can find the site.

Publishing removes that, and nothing replaces it.

---

## The order, in one line

**A1 buy the domain → A2 counsel sign-off → B1 and B2 fixed → B3–B8 done → DNS
configured → redirect and canonical checks pass → A3 your explicit go → both switches
flipped in one commit.**

---

### How the facts on this page were established

Everything above was measured on 20 August 2026 against `ce454e1`, in a scratch copy of
the repository, by: running the repo's publish gate (`node scripts/check-publish.mjs`)
and quoting its output verbatim; running the repo's build (`npm run build:draft`) and
listing and searching the files it produced; running the repo's test suite
(`npm test` — 138 checks passed, 0 failed); reading the layout, configuration, assistant
relay and guard code directly; and comparing the disputed hero line across commits with
`git show`.

To measure what the flip does, `published` was set to `true` **once, inside a throwaway
scratch copy that was never committed, never pushed, and deleted afterwards**. It was
reverted immediately, and the revert was proved three ways: `git status` clean, the
file's checksum identical before and after, and the publish gate failing again with the
same message. **The real repository was never modified — `published` is still `false`.**
