# 13 · Ethiopian flagship domain — zaya.et → zayaethiopia.com

**Strategy:** keep **one canonical website** (`zayaethiopia.com`, where the site lives and
what search engines index) while also owning the **local Ethiopian brand** (`zaya.et` or
`zaya.com.et`). The flagship domain **301-redirects** to the primary — so you get the local
brand equity with zero duplicate-content / SEO split, and nothing to rebuild.

The redirects are already wired in **`netlify.toml`** (`zaya.et`, `www.zaya.et`,
`zaya.com.et` → `https://zayaethiopia.com/…`). They activate the moment the domain is
connected — no code change needed later.

## When you're ready to add zaya.et (or zaya.com.et)
1. **Register it.** `.et` goes through **Ethio Telecom / the `.et` registry** (not a normal
   registrar). Expect a manual process and possibly company paperwork — **ZAYA App PLC
   qualifies**. Note: the second-level `zaya.et` may not be offered; `zaya.com.et` often is.
2. **⚑ Confirm DNS control (the make-or-break step).** Netlify needs you to point the
   domain's DNS at it (either delegate nameservers to Netlify, or add the A/CNAME records
   Netlify gives you). **Some `.et` registrations don't allow external DNS** — if you can't
   set DNS, the redirect can't work on Netlify. Confirm this **before** paying, if possible.
3. **Add it to the SAME Netlify site.** Netlify → your site → **Domain settings → Add a
   domain →** `zaya.et` (and `www.zaya.et`). Keep **`zayaethiopia.com` as the PRIMARY
   domain** (star it) — Netlify then auto-redirects the aliases, and the `netlify.toml`
   rules reinforce it.
4. **Done.** `https://zaya.et/anything` → `https://zayaethiopia.com/anything` (301), HTTPS
   auto-issued by Netlify. Business cards / local marketing can use **zaya.et**; the site
   and Google stay on **zayaethiopia.com**.

## If `.et` DNS turns out to be too restricted
Fallback: register a second global domain you fully control (e.g. `zayaet.com` or keep just
`zayaethiopia.com`), or park `zaya.et` at its own registrar with a simple forwarding rule to
`https://zayaethiopia.com` if the registrar offers URL forwarding. Don't let `.et` friction
delay the main launch — the primary is `zayaethiopia.com`.
