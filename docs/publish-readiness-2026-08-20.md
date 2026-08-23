# ZAYA website — publish readiness

**Prepared 20 August 2026 · originally measured against `design/system-pass-2026-08-19` @ `ce454e1`**
**Revised 23 August 2026 · rebased onto `main` @ `2b8eba9`, and re-measured against the
review branch `feat/truth-pass-2026-08-20` @ `c89cf61`**

> **Why this page was revised.** It was written on a branch that forked *before* the
> assistant gate, both design passes and the deploy fix landed on `main`, so several of
> its findings had been fixed while the page still reported them as open. Every such
> item below now carries a dated **RESOLVED** or **CHANGED** note saying what fixed it
> and where. Nothing that was true has been softened; two findings got *worse* on
> re-measurement and one is **new**.
>
> **Where the facts now live.** Items marked *on `main`* are fixed in the mainline.
> Items marked *on the review branch* are fixed on `feat/truth-pass-2026-08-20`, which
> is the branch the founder is reviewing and is **not merged to `main`**.

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

> **Re-run 23 August 2026 on the review branch — same output, byte for byte.** The flag
> is still `false` and the gate still refuses. Two things have been added since, and both
> make the flag *harder* to flip by accident, not easier: the parked build now refuses to
> run at `published: true`, and the publish gate now also refuses while the legal pages
> carry a placeholder effective date instead of a real one.

Flipping that word to `true` is **the founder's act, and nobody else's**. It is also
**irreversible in practice**: the moment search engines are allowed in, they copy the
pages, and those copies live in caches, indexes, screenshots and other people's archives.
You can take a page down; you cannot take it *back*.

Everything below is what stands between today and that flip.

---

# ✅ WAS THE BLOCKER — RESOLVED 20–23 August 2026

## The AI assistant chat now has its own on/off switch, and it ships OFF

> **RESOLVED on `main`.** The gate described below as missing was built on
> `feat/assistant-gate` (`9e120ab`) and **merged into `main`** at `b18aff7`. The
> assistant now has a switch of its own that publishing cannot reach, it ships **off**,
> and when it is off **no widget markup, no script and no styles are emitted on any
> page at all** — there is nothing to un-hide. Re-measured 23 August on the review
> branch: the built `/`, `/privacy/` and `/terms/` contain **zero** widget markup.
> The relay at `/api/assistant` now refuses every call that does not carry a shared
> secret, closing the separate fact that it was reachable by anyone.
>
> **Still open, and still the founder's:** the public-launch decision (W-D4b) is not
> taken, and the shared rate limiter (B7) is still not built. Those are prerequisites
> for turning the assistant **on**, not for publishing the site. **Publishing no longer
> exposes the assistant.**
>
> **One new, smaller problem this uncovered — see B9 below:** the Privacy Policy still
> tells visitors "This site offers a small assistant chat", which is no longer true
> while the assistant is off.

The original finding is kept below, unedited, because it is the record of why the gate
was built.

### —— original finding, 20 August 2026, now fixed ——

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

> **Status note, 2026-08-20 (added when the PII wording below was corrected).** Route (a)
> has since been **built** on branch `feat/assistant-gate` (commit `9e120ab`, off `main`):
> the assistant gets its own switch, ships **off**, emits no markup at all when off, and
> the `/api/assistant` endpoint now refuses every call that does not carry a shared
> secret — which also closes the fact, recorded above, that the endpoint was reachable by
> anyone. **That branch is not merged**, so everything this section says remains true of
> `main` and of this branch. The shared rate limiter is still **not** done. The
> public-launch decision (W-D4b) remains the founder's and is not taken.

> **Superseded, 2026-08-23.** That branch **is** merged now — `b18aff7` on `main`. The
> sentence above beginning "That branch is not merged" is no longer true, and neither is
> the table above it. See the RESOLVED box at the top of this section.

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
   - **What the filter actually does — give counsel this, not a summary.** One function
     (`scrubPII` in `netlify/functions/assistant/guard.mjs`) runs before the text is sent.
     It removes **exactly two things**: (a) e-mail addresses, and (b) runs of digits and
     separators containing **between 7 and 15 digits** (a phone number's worth). That is
     the whole of it. It is an **e-mail and phone-number filter — it is not "PII
     protection"**, and describing it as PII protection to counsel would misdescribe the
     transfer being reviewed.
   - **What therefore reaches Google unchanged.** I ran the function on real examples to
     confirm rather than reading it:

     | Typed by the visitor | What is sent to Google |
     |---|---|
     | `my name is Almaz Tesfaye` | unchanged — **names are not removed** |
     | `I live at Bole Road, Addis Ababa, house 42` | unchanged — **addresses are not removed** |
     | `my shop is Selam Suq near Meskel Square` | unchanged — **business names are not removed** |
     | `born 12/04/1987` | unchanged — **dates are not removed** |
     | `card 4111 1111 1111 1111` | **unchanged** — 16 digits is *above* the 15-digit ceiling, so a card number is **not** removed |
     | `call 0912 345 678` | `call [removed]` |
     | `a@b.com` | `[removed]` |
     | `TIN 0012345678` | `TIN [removed]` — a 10-digit tax number is removed *by accident*, because it is phone-shaped |
     | `my ID is ETH-2019-88213-A` | `my ID is ETH-[removed]-A` — partially mangled, again by accident |

     So the filter both **misses** things counsel would call personal data (names,
     addresses, a card number) and **removes** things that are not phone numbers. Counsel
     should be told this plainly.
   - **Where the overstatement came from, on the record.** Until 2026-08-20 a comment in
     `netlify/functions/assistant/assistant.mjs` read *"W-D3: PII never travels further
     than this line."* That was stronger than the code and should never be relied on. It
     has been corrected on branch `feat/assistant-gate` (commit `9e120ab`), together with
     the comment block above `scrubPII` itself; if you are reading an older checkout you
     may still see the original wording. The **code behaviour is unchanged** by that
     correction — only the description was wrong, which is precisely why it mattered.
   - The visitor-facing microcopy ("don't include phone numbers, email addresses or other
     personal details") and the Privacy Policy's Section 5a are **accurate** — the policy
     already says the filtering is "a safeguard, **not a guarantee**". The overstatement
     was internal, in the code comments, not in what visitors were told.
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

3. **One accuracy gap I found — RE-CHECKED 2026-08-23, STILL OPEN, unchanged.** The
   "Join the pilot" form on the homepage collects **name, phone, shop name and message**.
   I re-read the built form and the live policy on 23 August and the mismatch is exactly
   as first reported: the Privacy Policy's list of what you collect mentions name, phone,
   e-mail, role and message — it does **not** mention **shop name**, and it lists two
   fields the form does not have. For a sole trader a shop name can identify a person.
   Small, but it is the kind of mismatch a regulator reads first. **Give counsel this
   together with B9** — both are the policy and the site disagreeing about what the site
   actually does.

**Done looks like:** a written note from the lawyer saying the Privacy Policy and Terms —
including Section 5a, the assistant's data path — are cleared for publication, plus any
wording changes they require, merged into the two files.

### A3 · The explicit go

**What it is.** You, and only you, say the words: publish.

**Why it blocks.** Deliberately. The gate exists so that no engineer, no automated
process and no assistant can make this decision on your behalf.

**Done looks like:** A1 done, A2 signed off, Section B below complete, and you giving
the instruction in writing. Then `"published": false` becomes `"published": true`.

> **Corrected 2026-08-23.** This used to say `public/robots.txt` had to be changed in the
> same commit because they were two separate switches. **That is no longer true** —
> `robots.txt` is generated from the same flag and follows it automatically (see C3).
> What *does* have to happen in the same commit now is putting a **real effective date**
> on the Privacy Policy and Terms: the gate refuses a publish build while they read
> "set at go-live".

---

# B · ENGINEERING — what must be fixed or done first

Severity is stated honestly. **Revised 2026-08-23:** when this list was written, two
items had to be resolved before publish (B1 and B2). **Both are now done**, along with
B3, B4, B6 and the broken half of B5. Three items remain — B5's disabled sitemap, B8,
and the new B9 — and none of them is a stop on its own. The rest are either blocked on
you, or are configuration steps that only become possible after A1.

### ~~Must be resolved before publish~~ — both now resolved

**B1 · The assistant gate — ~~BLOCKER~~ RESOLVED (2026-08-23, on `main`).** Built,
merged at `b18aff7`, and re-measured: the assistant has its own switch, ships off, and
emits nothing when off. See the box at the top of this page. **This is no longer a stop.**

**B2 · The hero subheading changed size, and nothing said so — ~~HIGH~~ RESOLVED
(2026-08-23, on `main`).** The design pass's own F-series fix (`d8758b4`, merged at
`319ff9f`) restored the hero and the branch re-measured the delta as **0.00 at eight
different browser widths** — including the 1000px width that produced the ‑34.4px
described below. The finding as written is kept for the record; the defect is gone.

The original finding, 20 August 2026:

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

**B3 · The live build currently skips the safety gate — ~~MEDIUM~~ RESOLVED
(2026-08-23, on `main`).** Closed at the *other* end, at `2b8eba9`. The production build
still runs `build:draft` — deliberately, because the gated build refuses while the site
is parked, and switching it would have frozen the founder's preview. Instead
`build:draft` now runs `scripts/check-draft.mjs`, which **refuses to build at all when
`published` is true**. The pair is exhaustive over the flag, so the measurement below —
"`build:draft` produced all three pages with the do-not-index tag removed" — **can no
longer happen**: that build now exits before Astro runs.

I re-ran all four combinations myself on the review branch on 23 August, and quote the
exact exit codes:

| flag | `npm run build` (gated) | `npm run build:draft` (parked) |
|---|---|---|
| `published: false` (as committed) | **refuses, exit 1** — *"publish gate: site.json published is false"* | **succeeds, exit 0** — output carries `noindex, nofollow` on all three pages and a `Disallow: /` robots.txt |
| `published: true` (throwaway flip, restored) | **refuses, exit 1** — *"privacy has an UNSET effective date"* | **refuses, exit 1** — *"a draft build would emit an INDEXABLE site with no gate having run"* |

So **no build path on this branch produces an indexable site**, in either flag state —
and at `published: true` *both* paths refuse, because the publish gate also now checks
that the legal pages carry a real effective date (`0074803`). The throwaway flip was
reverted immediately and the revert proved four ways (clean `git status`, identical
SHA-256, the gate failing again with the original message, and a clean worktree).

The original finding, 20 August 2026:

**B3 · The live build currently skips the safety gate — MEDIUM.** `netlify.toml` sets the
production build to `npm run build:draft`, which is the *ungated* build. This was a
deliberate temporary measure so the site could sit on the free address. But it means the
publish gate would **not run** on the real deploy. I measured this: with `published` set
to `true` in a throwaway copy, `build:draft` produced all three pages **with the
"do not index" tag removed** — a "draft" build is not a safe build; safety comes entirely
from the one flag in `site.json`. At go-live this line must be switched back to
`npm run build`. Note that **`GO-LIVE.md` Step 4 does not mention this step** even though
`netlify.toml` points at it — the instructions have a hole in them.

**B4 · Two different `published` flags exist — ~~LOW~~ RESOLVED (2026-08-23, on `main`).**
The dead file was deleted. `src/config/site.ts` no longer exists in `main`; I checked.
There is now exactly one `published` flag, `src/content/data/site.json`, read by exactly
three consumers: the page layout, the robots route, and the publish gate.

**B5 · The site map is switched off, but `robots.txt` promises one — ~~LOW~~ RESOLVED
(2026-08-23, on `main`).** The broken promise is gone. `public/robots.txt` was deleted
and replaced by a generated route, `src/pages/robots.txt.ts`, which emits **no `Sitemap:`
line at all** while the plugin is disabled. I read the generated output on 23 August and
confirmed it. **The sitemap plugin is still disabled** (`@astrojs/sitemap` 3.2 crashes on
this build) — that part remains an open, genuinely LOW item: re-enable the integration
and add the `Sitemap:` line back **in the same change**, never one without the other.

**B6 · The content editor loads code from the internet without a version pin —
~~LOW/MEDIUM~~ RESOLVED (2026-08-23, on the review branch).** Fixed on
`fix/cms-oauth-hardening` (`62df316`), merged into the review branch on 23 August. The
editor bundle is now **pinned to an exact version** and carries an **SRI hash**
(`sha384`) plus `crossorigin`, so the browser refuses to run it if the file at that URL
ever changes. Its own test suite asserts all of that, and the tests pass.

**Two further `/admin` holes were closed in the same change, and neither was in the
original list — both were publish blockers in their own right:**

- **The login token could be handed to the wrong website.** The `/admin` login sent the
  GitHub token back with a wildcard destination. It now checks the receiving origin
  against an allowlist derived from this deploy, and refuses look-alike domains, plain
  `http`, sandboxed frames and forged host headers. Tested.
- **The login had no CSRF protection.** The GitHub handshake now mints a 256-bit random
  `state`, carries it in an `HttpOnly` / `SameSite=Lax` / `Secure` cookie that expires in
  ten minutes, burns it on use, and **rejects the callback** if it is missing, empty,
  truncated or mismatched. Tested, including the rejection paths.
- The OAuth scope was also narrowed from full private-repo access to
  `public_repo,user:email`.

**B7 · The assistant's abuse limit is not global — STILL OPEN, but no longer blocks
publishing (2026-08-23).** Unchanged in the code. What changed is what it blocks: with
B1 resolved, this is now a prerequisite for turning the **assistant** on (W-D4b), not for
publishing the **site**. Verified in the
code and openly admitted there: request counting happens per running server instance, so
neither the per-visitor limit nor the daily budget is truly enforced across the whole
site. Acceptable for a quiet preview; not acceptable for a public page. This is the
public-launch item that was deferred.

**B8 · The repo's own `npm run check` cannot run — STILL OPEN, LOW (re-checked
2026-08-23).** Unchanged. I ran it again on the review branch: it still stops and asks to
install `@astrojs/check`. Worth fixing so pre-publish checks are actually runnable.

**B9 · The Privacy Policy describes an AI chat the site no longer has — NEW, MEDIUM
(found 2026-08-23).** A consequence of B1 being fixed. Section 5a of the live Privacy
Policy opens *"This site offers a small assistant chat"* and goes on to describe the
Google/Gemini data path in detail. With the assistant off, **the site offers no such
chat** — no widget, no script, nothing. I measured it: the word "assistant" appears
**four times in the built `/privacy/` page and zero times anywhere else in the built
site.** So the only place the assistant still exists on the deployed site is a policy
paragraph saying it exists.

That is the same class of over-claim this whole review is about, pointing the other way:
a document promising a feature rather than a feature outrunning its evidence. It is
**not** a safety problem — it over-discloses rather than under-discloses, and nothing is
being collected — but it should not go to counsel (A2) or to the public in this state.

**This has deliberately not been fixed here.** Section 5a is legal text and its wording
is bound up with the counsel review in A2. The two clean options are (a) render Section
5a only when the assistant is actually switched on, from the same flag, so the disclosure
and the feature can never disagree; or (b) reword it to the conditional — *"if and when
this site offers an assistant chat"*. **Either way it is a decision for the founder and
counsel together, not an engineering edit**, which is why it is written down here instead
of changed.

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

**Supporting files — RE-MEASURED 2026-08-23 on the review branch.** The inventory has
changed, because the AI-generated photographs were deleted and real app screenshots were
added: `/robots.txt`, `/favicon.svg`, `/og.png`, `/admin/index.html`, `/admin/config.yml`
and 24 files under `/_astro/` (the stylesheet, one script, **6 font files, and 16
screenshots of the real app** — English and Amharic, at two pixel densities). **32 files
in total**, up from 23. The three indexable pages are unchanged.

> The old count said "7 photographs". There are now **no photographs** in the build —
> see C2.

### C2 · What personal and business information goes public with it

- Your two phone numbers and `zayaapp@gmail.com` appear on the homepage and in the legal
  pages. Once indexed, expect scraping and spam.
- The "Join the pilot" form goes live and starts collecting **real names and real phone
  numbers** from strangers, into the host's form store. This is the moment the Privacy
  Policy stops being a document and starts being an obligation — which is why A2 comes
  first.
- ~~The eight photographs on the site are AI-generated placeholders.~~ **RESOLVED
  2026-08-23, on the review branch.** All eight AI-generated images were **deleted from
  the repository**, not merely hidden — including both trademark exposures (the
  Coca-Cola cooler and the Nestlé "Nido" pack) and, separately, an AI-generated picture
  of an app screen that had been presented as though it were the real product. In their
  place the site now shows **16 screenshots of the actual app**, in English and Amharic,
  each recorded with its provenance. There is no longer any AI-generated imagery on the
  site, so the 8 July 2026 commercial-use ruling and its accepted trademark exposure no
  longer need re-confirming for a publicly indexed site — there is nothing left for
  them to cover.

### C3 · ~~Important: it is TWO switches, not one~~ — CORRECTED 2026-08-23: it is now ONE

**This section has been overtaken by a fix and its warning no longer applies.** The
hand-edit trap it describes is gone.

`public/robots.txt` — the static file that had to be edited by hand — **was deleted**.
`/robots.txt` is now generated by `src/pages/robots.txt.ts` from the **same single flag**
as the pages' "do not index" tag. Flipping `published` to `true` now changes **both** in
the same build, with no ordering to get wrong and nothing to remember. I re-measured this
on 23 August: at `published: false` the generated file reads `Disallow: /`; the flag is
read by exactly three consumers and there is no second switch to forget.

**One thing from the original still holds:** the flag is **site-wide and immediate**.
There is no way to publish one page and hold another back.

**And a stronger guarantee has been added since.** Because `build:draft` now refuses at
`published: true` and the gated `build` refuses until the legal pages carry a real
effective date, **flipping the flag on its own does not publish anything — it makes the
site stop building** until the gate is genuinely satisfied. That is the intended
behaviour, not a fault.

The original text, 20 August 2026:

> I measured this. Flipping `published` to `true` **removes the "do not index" tag from
> all three pages at once**, but **does NOT change `public/robots.txt`** — a comment in
> that file claimed "a build step regenerates this" and there was no such build step, so
> the file still said `Disallow: /` and had to be edited by hand in the same commit.
> Flipping only one of the two left the site in a contradictory state either way.

### C4 · ~~The one surface that should not be public yet~~ — RESOLVED 2026-08-23

**The AI assistant is no longer exposed by publishing.** The original text said the only
thing holding the assistant back from public traffic was that nobody could find the site,
and that publishing removed it. That was true when written; it is not true now.

The separate decision the code kept describing has been **implemented**. The assistant is
off, emits nothing, and its relay refuses unauthenticated callers. Publishing the site no
longer turns it on — turning it on is its own act, with its own switch and its own
prerequisites (B7, W-D4b).

**What replaced "nobody can find the site" is an actual switch.**

The original text, 20 August 2026:

> **The AI assistant.** Not my opinion — the repository's own record. Three separate
> places in the code describe it as a founder-access preview whose public launch is a
> *separate* decision, and that decision is not implemented anywhere. Right now the ONLY
> thing holding it back from public traffic is the fact that nobody can find the site.
> Publishing removes that, and nothing replaces it.

---

## The order, in one line

**Revised 2026-08-23.** B1, B2, B3, B4, B5's broken promise and B6 are **done**. B7 no
longer blocks publishing. What is left:

**A1 buy the domain → A2 counsel sign-off (now including B9 and the A2·3 field mismatch)
→ B5's sitemap, B8 and B9 done → DNS configured → redirect and canonical checks pass →
A3 your explicit go → the single flag flipped, with a real effective date on the legal
pages in the same commit.**

Two changes to the shape of that line are worth saying plainly. **It is one switch now,
not two** — `robots.txt` follows the flag automatically. And **the legal effective date
is now part of the gate**, so the go-live commit must set a real date or the build will
refuse.

The original line, 20 August 2026:

> **A1 buy the domain → A2 counsel sign-off → B1 and B2 fixed → B3–B8 done → DNS
> configured → redirect and canonical checks pass → A3 your explicit go → both switches
> flipped in one commit.**

---

### What else changed on the review branch (not in the original list)

The branch the founder is reviewing, `feat/truth-pass-2026-08-20`, also removed a set of
public claims the site could not support. These were not in the original list because
this page was written to answer "what stands between today and publishing", not "is what
the site says true". They matter here because **each one was a thing the site claimed and
could not evidence**, and every one of them would have been indexed on the day of the
flip:

- **The four priced subscription tiers are withdrawn.** The site advertised paid plans at
  named prices. There is no billing code anywhere in the product to charge them with, so
  the prices were a promise nothing could keep. They are gone rather than restated.
- **The "pilot is live" badges are gone.** The site carried badges implying a merchant
  pilot was already running. It is not. The badges were removed rather than softened.
- **The invented app screenshot is deleted.** One image presented as a picture of the
  product was AI-generated — it showed a screen the app does not have. It has been
  deleted and replaced with screenshots of the real app (see C2).
- **The ZAYA backronym is now on the home page**, as a short section explaining what the
  four letters stand for — real, checkable meaning in place of the feature claims that
  were removed.
- **Feature claims are now on one labelling axis**, so a visitor can tell at a glance
  what exists today from what is planned, instead of every claim reading as shipped.
- **Five measured accessibility failures were fixed** at the same time.

None of this changes the publish decision itself. It changes what would be published.

---

### How the facts on this page were established

**The 20 August measurements.** Everything not marked as revised was measured on
20 August 2026 against `ce454e1`, in a scratch copy of the repository, by: running the repo's publish gate (`node scripts/check-publish.mjs`)
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

**The 23 August revisions.** Every item marked RESOLVED, CHANGED, CORRECTED, RE-MEASURED
or RE-CHECKED above was re-measured on 23 August 2026 in a throwaway worktree of
`feat/truth-pass-2026-08-20` @ `c89cf61`, by: running the repo's full test suite
(`npm test` — all five suites pass, including the new CMS OAuth suite); running the
build; listing and searching every file the build produced; running **both** build
commands in **both** flag states and recording all four exit codes (the table in B3);
reading `astro.config.mjs`, the generated robots route, the page layout, the assistant
config and the `/admin` page directly; and confirming by direct check that
`src/config/site.ts` and `public/robots.txt` no longer exist.

The `published: true` flip was again made **once, in a throwaway worktree**, and again
reverted immediately — this time proved **four** ways: `git status` clean for that file,
SHA-256 identical to the committed version
(`2d937fd7b3bf0d531c331bb3d1ed58708bf3373cc872574f078a079c7909a3b7`), the publish gate
failing again with its original message, and the whole worktree clean. **`published` is
still `false` in every branch, and nothing in this revision published anything.**

**What was deliberately NOT done:** nothing was merged to `main`; no domain, DNS or
hosting setting was touched; the assistant was not enabled; and the Privacy Policy's
Section 5a was left exactly as it is, because B9 is counsel's call and not an engineering
edit.
