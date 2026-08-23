# Reference screens — where these came from

These 28 PNGs are **not website artwork**. They are the platform's own
**S9-T12 golden baselines** — the nine reference screens the founder reviewed
and approved — copied here byte-for-byte so the website can show the product
instead of describing it.

| | |
|---|---|
| Source repo | ZAYA platform monorepo |
| Source path | `apps/customer_app/test/goldens/baselines/` |
| Branch | `main` |
| Recording commit | `a196d42d3490d66eea43012fd458a52d417cf386` (2026-08-18) |
| Reachable from | platform `main` @ `1b6114a` (2026-08-23) |
| Copied | 2026-08-23, website truth pass R3(b) |

**Integrity.** Every file here hashes identically to its blob in that commit
(`git hash-object` == `git rev-parse main:<path>`). Nothing was re-rendered,
retouched, cropped, upscaled or recompressed. The machine-readable record is
`_provenance.json`.

## What you are looking at

- **360 × 800 CSS px at DPR 1.0** — the low-end reference viewport. Display at
  natural size or smaller. There is no 2× asset; making one would be a fabrication.
- **Two text scales.** `1_25x` is the shipped app-wide baseline. `1_5625x` is
  that baseline under a 1.25× OS large-text bump. There is deliberately no 1.0×
  leg, because no user ever sees one.
- **Two languages, EN and AM** — the ruled pilot bar (FDR-028 r1). `om`/`ti` are
  staged post-pilot and have no approved look to freeze, so no baseline exists.

## The Amharic screens say DRAFT, and they are right

Every `am` baseline carries a visible badge —
**ረቂቅ — የአፍ መፍቻ ቋንቋ ተናጋሪ ግምገማ በመጠበቅ ላይ** / *DRAFT — pending native review*.
The Amharic strings are machine-authored and the native-reviewer pass (S9-T10)
has not happened yet, so the gallery stamps them (`galleryPilotDraftLangs =
{'am'}`). English is the authoring language and carries no badge.

That badge is the most honest thing in the set. It stays in the frame and it is
restated in words on the page. The website does not get to undo, with a crop,
the app's refusal to let a draft translation pass as finished.

## Two things in the pixels that are NOT the product

1. **The gallery control bar.** The pill row along the bottom edge of every
   image — `EN / አማ / OM / ትግ` and `መደበኛ/Standard / ካልቅ/Large` — is the reference
   gallery's own language and text-size switcher. The goldens were recorded
   *chrome-mounted* on purpose: that is the view the founder approved, and a
   bare-screen re-record would freeze a view nobody signed off. It stays in the
   picture because cropping it out would be retouching.
2. **Empty squares where icons should be.** The golden harness
   (`apps/customer_app/test/flutter_test_config.dart`) loads only the three
   bundled *text* families — Poppins, Inter, Noto Sans Ethiopic. The Material
   icon font is never loaded, so every `Icon()` rasterises as the `.notdef` box.
   Those squares are an artefact of the recording harness, not the app's
   iconography. Same rule: not painted over.

Both are stated on the page itself, not just here.

## Two screens deliberately NOT brought across

`screen4` (Shop detail) and `screen8` (Compare prices) exist in the platform
repo and are part of the approved nine. They are **not** copied here.

- `screen4` renders a `Distance — 350 m · Bole` row.
- `screen8` renders *"Found in 4 shops nearby"*, *"Results match by item name
  across nearby shops"*, and per-shop distances (850 m, 350 m, 550 m, 1.2 km).

The website carries a zero-tolerance proximity ratchet
(`scripts/test-claims.mjs`, ratchets A and C) because **the platform has no shop
lat/lng at all** — browse is area-anchored by construction. The copy pass
withdrew every proximity claim from the words. Shipping these two screens would
put the same claim straight back as a picture, where the word-count ratchet
cannot see it.

They are not doctored out of the record; they are simply not brought across, and
the reason is written down here and in `_provenance.json`. Those baselines
predate both the website ban and the platform's own go-live sweep — four
catalogued `nearby` strings still stand in `packages/dart/zaya_localization`.

## Refreshing

Re-copy from the platform repo. **Never re-render here.** If the platform
re-records (for example the S9-T13 linux lane), bump `sourceCommit` in
`_provenance.json` and re-copy the whole set in one commit.
