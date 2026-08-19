# ZAYA Website Assistant — founder setup (5 minutes)

**Status:** FOUNDER-ACCESS PREVIEW (CR-027/ADR-024 accepted, FDR-019 W-D4a).

> ⚠ **CHANGED 2026-08-20 (founder ruling).** The assistant no longer ships on
> the parked site. It used to appear on every page of
> **https://zayaethiopia.netlify.app**, and the service answering it accepted
> requests from anyone on the internet. Both are now closed. The assistant has
> its OWN switch, separate from the site's publish flag, and it is **off**.
>
> **Your preview still exists but must be turned on once** — the 4 steps are in
> **`docs/ASSISTANT-GATE.md` §3 "For the founder"**, written for a phone. Until
> then there is no chat button anywhere, and everything below about *using* the
> assistant applies to the `preview/assistant` deploy only.

The public launch is a separate gate (W-D4b: real domain + your explicit go) and
is now enforced in code: the publish gate refuses to build a published site with
the assistant on unless `src/config/assistant.json` records your approval.

## It already works — before any key

The assistant's curated layers (FAQ, knowledge base, rules — in **English,
Amharic, Afaan Oromoo and Tigrinya**) run entirely on our own server function
with **no AI provider involved**. Open the site, click the chat button, and ask
things like *"What is ZAYA?"*, *"ዛያ ምንድን ነው?"*, *"What does it cost?"*, *"How
do I join the pilot?"*.

Only one thing is dark without a key: the **English AI fallback** for questions
the curated layers don't cover (those currently answer with an honest
"contact the team" handoff).

## Turning on the English AI fallback (Gemini free tier)

1. Go to **https://aistudio.google.com** and sign in with a Google account.
2. Click **"Get API key"** → **"Create API key"**. Copy the key (starts `AIza…`).
3. Open **Netlify → the zaya-website site → Site configuration → Environment
   variables → Add a variable** (this is the same screen where
   `ZAYA_ASSISTANT_TOKEN` goes — see `docs/ASSISTANT-GATE.md` §3):
   - Key: `GEMINI_API_KEY`
   - Value: *(paste the key)*
   - Scope: All (or Functions).
4. **Trigger a redeploy** (Deploys → Trigger deploy → Deploy site).
5. Ask an English question the FAQ doesn't cover — you'll now get a grounded
   AI answer instead of the handoff.

**Never put the key anywhere else.** Not in a file, not in the repo, not in a
chat message. The repo has a secret-scanning CI (gitleaks) that fails any push
containing a key, and `.env` files are gitignored. The key is sent to Google in
a request header only — it never reaches the browser.

## What the assistant will and won't do (by construction)

- Answers ONLY from ZAYA's approved website content (FAQ/KB in the repo).
  Roadmap items (delivery, diaspora basket, rides…) are always "coming /
  on the roadmap" — never "available".
- **አማርኛ / Afaan Oromoo / ትግርኛ answers come only from the curated layers** —
  the AI generates English only (your W-D5 ruling), enforced in code both by
  the input gate (Ethiopic OR romanized-Oromo questions never reach the model)
  AND a positive English-only check on any model reply. ⚠ The am/om/ti strings
  are **draft-unverified** — your native-speaker review is a W-D4b
  (public-launch) precondition, and it covers **both**
  `netlify/functions/assistant/kb.mjs` (the answers) **and** the four greeting
  strings in `src/components/AssistantWidget.astro`.
- **E-mail addresses and phone-shaped digit runs** a visitor types are stripped
  **before** any AI call. Be precise about the scope: that scrub
  (`netlify/functions/assistant/guard.mjs → scrubPII`) removes e-mails and
  digit runs of 7–15 digits, **and nothing else** — names, addresses, ID
  numbers and other free text are NOT stripped and DO reach Google on the
  English model path. The widget's "don't include personal details" microcopy
  is the other half of the control and it is advisory, not enforcement. The
  Privacy Policy discloses the AI data flow (Section 5a).
- Off-topic questions are deflected; unknown questions hand off to the
  existing contact section — the assistant never invents an answer and never
  captures leads itself.
- Rate-limited per IP; 500-character question cap; the free tier's own quotas
  are the hard ceiling. **Free tier = this preview only** — the production
  tier decision is yours at W-D4b.

## Testing checklist (your FAT-style pass)

1. Curated: "What is ZAYA?" (en + am + om + ti via the language selector).
2. Pricing honesty: "How much is the Pro plan?" → 299 ETB/month, from the KB.
3. Roadmap honesty: "Can I get delivery today?" → "on the roadmap", never "yes".
4. Diaspora honesty: "Can I send money with ZAYA?" → NOT a money-transfer service.
5. PII microcopy visible; type a phone number → it never appears in any answer.
6. Off-topic: "Write me a poem about football" → polite deflection.
7. No key: an uncovered English question → the honest "AI-fallback dark" handoff.
   With the key: the same question → a grounded English answer.
