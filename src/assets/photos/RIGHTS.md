# Photos — REMOVED 2026-08-23 (truth pass R3)

**This directory holds no photographs any more.** Eight AI-generated images used
to live here and appear on the homepage. All eight are gone — files and all —
and the reason is written down rather than left as a silent deletion.

## What was removed

`storefront.jpg` · `storefront-wide.jpg` · `counter-sale.jpg` · `supermarket.jpg`
· `stock-check.jpg` · `credit-book.jpg` · `customer-app.jpg` · `diaspora-family.jpg`

Recoverable from git history at `5d923d2`.

## Why — two separate reasons

### 1. `customer-app.jpg` was a fabricated app interface

It showed a woman in a shop aisle holding a phone whose screen displayed an
**invented UI** — not ZAYA's layout, not ZAYA's palette, not any build that has
ever existed. It sat in the **customer role pane**, under the pill **"Built — in
device testing"**, with the alt text *"A customer comparing local choices with
ZAYA"*. That is a generated picture of a product, presented as evidence that the
product exists. It is removed unconditionally. It is not relabelled, not kept as
an "illustration", and no condition brings it back.

### 2. All eight carried visible third-party trademarks

The previous version of `_rights.json` recorded the exposure itself. Quoted
verbatim from the `decision` field it carried:

> "Trademark exposure (Coca-Cola cooler in storefront hero; Nestlé 'Nido' in
> customer-app.jpg) reviewed and ACCEPTED by the founder 2026-07-08; proceeding
> with these images for the pilot."

A visible **"Illustration"** label answers *"is this a photograph?"*. It does not
answer *"may we publish Coca-Cola's and Nestlé's marks in our advertising?"*.
So a relabel leaves the actual exposure exactly where it was, which is why
relabelling was not treated as a fix.

`storefront.jpg` had a third problem on top: it invented a lit **"ZAYA MINI
MARKET"** shopfront that does not exist, and the page captioned it as a
"ZAYA-powered" shop.

## The standing option — recorded, NOT implemented

If the founder later wants any of these back on the site:

1. each carries a **visible "Illustration" label in the rendered page**, not only
   in a manifest; and
2. the **trademark question goes to him as its own decision**, separately from
   the AI-provenance question.

Those are two different questions, and the 2026-07-08 clearance answered only the
first. Provenance was cleared. The marks were *noted and accepted* for a pilot
that had not opened — which is not the same as clearing them for public
promotion. This pass does not put any of them back.

## What replaced them

`src/assets/screens/` — the platform's own **S9-T12 golden baselines**, the
reference screens the founder reviewed and approved, copied byte-for-byte and
unretouched, with full provenance in
[`../screens/PROVENANCE.md`](../screens/PROVENANCE.md).

## The gate still runs

`scripts/check-publish.mjs` still reads `_rights.json` and still refuses a
publish build unless `cleared === true`, and still fails on any
`*rights-pending*` filename in this directory. Both checks stay live. They simply
have nothing left to act on.
