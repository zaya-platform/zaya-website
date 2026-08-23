// CLAIM RATCHETS — the ONE LABELLING AXIS (R1) and the PROXIMITY BAN (R4).
// Dep-free node, same style as the other scripts/test-*.mjs. Run: npm test.
//
// WHY THIS FILE EXISTS
// The apps already carry an exact-count ratchet for the banned word "nearby"
// (packages/dart/zaya_localization/test/qf4_strings_test.dart, test "QF4-2b
// RATCHET"). Its rule, quoted from that test: "'nearby' is barred from all copy
// until shop lat/lng exists ... The count is deliberately exact, not an upper
// bound." That ratchet was written after a de-jargoning pass traded "pilot
// shops" for "nearby shops" — the ban regressed the moment nobody was counting.
// The website had no equivalent, so the same claim walked straight back in
// here. This is that ratchet, extended to this repo's runner.
//
// The underlying fact, checked against the platform on 2026-08-23: there is NO
// latitude/longitude anywhere in the schema (grep over database/migrations
// returns nothing), and browse is AREA-anchored by construction —
// 0010_consumer_browse.sql: "browse is AREA-anchored (a query param), never
// GPS-only". The product lets a customer SELECT an area. It cannot rank shops
// by how near they are, so the site may not say that it does.
//
// FOUR RATCHETS:
//   A  the banned word "nearby" — exact count 0, no catalogued exceptions
//   B  the TAGLINE "near you" — exact per-file counts, asserted BOTH ways
//   C  other proximity claims — 0 except a catalogued denial set
//   D  the map-pin glyph — exactly 1, and it must be the contact-card pin
//   E  the ONE LABELLING AXIS — only the four rungs, spelled exactly, and
//      nothing on the site claiming the "In pilot" or "Live" rungs
//
// Counts are EXACT on purpose. Removing a catalogued occurrence fails too —
// that forces the catalogue to be updated deliberately instead of drifting.
import { readFileSync, readdirSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  ✔ ${name}`);
  else { failures += 1; console.error(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`); }
};

// The shipped-copy surface. Anything a visitor can read, plus the assistant's
// curated layers (which speak in ZAYA's voice and are held to the same rule).
const COPY_FILES = [
  'src/pages/index.astro',
  'src/layouts/Base.astro',
  'src/components/AssistantWidget.astro',
  'src/content/data/site.json',
  'src/content/data/home.json',
  'src/content/data/faq.json',
  'src/content/data/pricing.json',
  'src/content/data/contact.json',
  'src/config/pricing.ts',
  'src/config/contact.ts',
  'netlify/functions/assistant/kb.mjs',
  'netlify/functions/assistant/assistant.mjs',
];

// Count COPY, not commentary. A rule written down in a comment ("the 'nearby'
// node is now 'area'") must not consume the budget the ratchet is guarding, or
// the next real occurrence slips in under the same number. `://` is excluded so
// a URL is never mistaken for a line comment.
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const SOURCES = new Map(COPY_FILES.map((f) => [f, stripComments(read(f))]));

const countIn = (body, needle) =>
  (body.toLowerCase().match(new RegExp(needle.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

const total = (needle) => {
  const per = {};
  let sum = 0;
  for (const [file, body] of SOURCES) {
    const n = countIn(body, needle);
    if (n) { per[file] = n; sum += n; }
  }
  return { sum, per };
};

// ── A. the banned word ───────────────────────────────────────────────────────
console.log('RATCHET A — "nearby" is barred from all copy (no shop lat/lng exists):');
{
  const { sum, per } = total('nearby');
  check('exactly 0 occurrences of "nearby" in shipped copy', sum === 0, JSON.stringify(per));
}

// ── B. the tagline ───────────────────────────────────────────────────────────
// "Everything near you." is the TAGLINE — a statement of purpose, not a feature
// claim, and it stays. It is catalogued file-by-file so it cannot quietly breed
// into feature copy, and each site is asserted to still be there so the numbers
// below never become a stale allowance.
console.log('\nRATCHET B — the tagline "near you" survives at exactly its catalogued sites:');
{
  const CATALOGUED_NEAR_YOU = {
    'src/pages/index.astro': 3,          // header lockup aria-label + header .tl + footer .tl
    'src/content/data/site.json': 1,     // the tagline field itself
    'src/content/data/home.json': 1,     // hero eyebrow
    'src/content/data/faq.json': 1,      // "What is ZAYA?" answer
    'netlify/functions/assistant/kb.mjs': 1, // the what-is-zaya curated answer
  };
  const { sum, per } = total('near you');
  const expected = Object.values(CATALOGUED_NEAR_YOU).reduce((a, b) => a + b, 0);
  check(`exactly ${expected} "near you" occurrences site-wide`, sum === expected, `found ${sum}: ${JSON.stringify(per)}`);
  for (const [file, n] of Object.entries(CATALOGUED_NEAR_YOU)) {
    const got = countIn(SOURCES.get(file), 'near you');
    check(`${file} carries exactly ${n}`, got === n,
      got > n ? `${got} — a NEW proximity claim entered here`
              : `${got} — one was removed; update the catalogue so the ratchet keeps counting honestly`);
  }
  check('the tagline is still the exact signed string in site.json',
    JSON.parse(read('src/content/data/site.json')).tagline === 'Everything near you.');
}

// ── C. every other proximity claim ───────────────────────────────────────────
console.log('\nRATCHET C — no other proximity wording, except the catalogued denials:');
{
  // Barred outright: each of these asserts that ZAYA knows where the reader is.
  for (const phrase of ['near them', 'near my', 'around you', 'close to home', 'closer to home', 'closest shop', 'walking distance', 'shops near you', 'sorted by distance']) {
    const { sum, per } = total(phrase);
    check(`0 occurrences of "${phrase}"`, sum === 0, JSON.stringify(per));
  }
  // "near me" survives ONLY where the product DENIES the claim: the FAQ question
  // the answer refutes, the assistant chip that asks it, and the KB keywords
  // that route it to the refutation.
  const CATALOGUED_NEAR_ME = {
    'src/content/data/faq.json': 1,                    // "Does ZAYA find shops near me?" (answered: it works by area)
    'netlify/functions/assistant/assistant.mjs': 1,    // the same question as a follow-up chip
    'netlify/functions/assistant/kb.mjs': 1,           // area-not-proximity keyword
  };
  const { sum, per } = total('near me');
  const expected = Object.values(CATALOGUED_NEAR_ME).reduce((a, b) => a + b, 0);
  check(`exactly ${expected} "near me" occurrences, all of them denials`, sum === expected, `found ${sum}: ${JSON.stringify(per)}`);
  for (const [file, n] of Object.entries(CATALOGUED_NEAR_ME)) {
    check(`${file} carries exactly ${n} "near me"`, countIn(SOURCES.get(file), 'near me') === n);
  }
  const faq = read('src/content/data/faq.json');
  check('the "near me" FAQ answer refuses the proximity claim and says AREA instead',
    /works by area, not by your location/i.test(faq) && /does not read your position/i.test(faq));
  const kb = read('netlify/functions/assistant/kb.mjs');
  check('the assistant has an area-not-proximity entry that denies distance sorting',
    /id: 'area-not-proximity'/.test(kb) && /works by AREA, not by your location/.test(kb));
}

// ── D. the map-pin glyph ─────────────────────────────────────────────────────
console.log('\nRATCHET D — the dropped-pin glyph is a geolocation claim drawn instead of written:');
{
  const index = read('src/pages/index.astro');
  const pins = [...index.matchAll(/M12 21s-\d/g)];
  check('exactly 1 map-pin path remains on the page', pins.length === 1, `found ${pins.length}`);
  if (pins.length === 1) {
    const ctx = index.slice(Math.max(0, pins[0].index - 400), pins[0].index + 200);
    check('the surviving pin is the contact card\'s "Visit us" pin (a real street address on a map)',
      /google\.com\/maps/.test(ctx));
  }
  check('no HUB node uses a pin glyph (the area node is a shop grid)', !/key: 'area'[\s\S]{0,200}M12 21s-/.test(index));
}

// ── E. the one labelling axis ────────────────────────────────────────────────
console.log('\nRATCHET E — ONE labelling axis, spelled exactly, with nothing claiming a rung it has not reached:');
{
  const AXIS = {
    planned: 'Planned',
    built: 'Built — in device testing',
    pilot: 'In pilot',
    live: 'Live',
  };
  const index = read('src/pages/index.astro');

  // Only the four rung classes may appear on a status chip or media pill.
  const chipClasses = [...index.matchAll(/class="st ([a-z-]+)"/g)].map((m) => m[1]);
  const mediaClasses = [...index.matchAll(/class="role-status ([a-z-]+)"/g)].map((m) => m[1]);
  const rungs = Object.keys(AXIS);
  check('every status chip uses a rung class', chipClasses.every((c) => rungs.includes(c)),
    `saw: ${[...new Set(chipClasses)].join(',')}`);
  check('every role-media pill uses a rung class', mediaClasses.every((c) => rungs.includes(c)),
    `saw: ${[...new Set(mediaClasses)].join(',')}`);

  // Each chip's TEXT is the rung's wording verbatim — one axis means one spelling.
  for (const [cls, label] of Object.entries(AXIS)) {
    const bad = [...index.matchAll(new RegExp(`class="st ${cls}">([^<]*)<`, 'g'))]
      .map((m) => m[1]).filter((t) => t !== label);
    check(`every "st ${cls}" chip reads exactly "${label}"`, bad.length === 0, `saw: ${JSON.stringify(bad)}`);
    const badMedia = [...index.matchAll(new RegExp(`class="role-status ${cls}">([^<]*)<`, 'g'))]
      .map((m) => m[1]).filter((t) => t !== label);
    check(`every "role-status ${cls}" pill reads exactly "${label}"`, badMedia.length === 0, `saw: ${JSON.stringify(badMedia)}`);
  }

  // THE HONEST STATE: nothing on this site has reached "In pilot" or "Live".
  check('no chip or pill claims the "In pilot" rung',
    !chipClasses.includes('pilot') && !mediaClasses.includes('pilot'));
  check('no chip or pill claims the "Live" rung',
    !chipClasses.includes('live') && !mediaClasses.includes('live'));

  // The parallel vocabulary this replaced may not come back.
  for (const dead of ['Launching', 'Our vision', 'Live · pilot', 'Live now', 'Merchant pilot live', 'on the roadmap', 'Roadmap']) {
    const { sum, per } = total(dead);
    check(`retired label "${dead}" is gone`, sum === 0, JSON.stringify(per));
  }

  // The footer legend teaches the whole axis, in order, and says what is unreached.
  for (const label of Object.values(AXIS)) {
    check(`footer legend carries "${label}"`, new RegExp(`class="lg [a-z]+">${label}<`).test(index));
  }
  check('footer legend states that nothing is in pilot or live',
    /nothing on this site is in pilot or live yet/.test(index));

  // The three BUILT capabilities are surfaced at the same rung — the delivery +
  // COD settlement machine included. It was real, built work buried under a
  // "Roadmap" chip; a built thing filed under a lower rung is the same defect
  // as an unbuilt thing filed under a higher one.
  check('delivery + COD settlement is surfaced as a BUILT capability, not buried',
    /Delivery &amp; COD settlement <span class="st built">Built — in device testing<\/span>/.test(index));
  check('merchant tools, customer browse/order and delivery share the trust rail at one rung',
    (index.match(/<b class="axis">Built — in device testing<\/b>/g) || []).length === 3);

  // The assistant's curated layers use the same rungs, and none claims pilot/live.
  const kbSrc = read('netlify/functions/assistant/kb.mjs');
  const statuses = [...kbSrc.matchAll(/^\s*status: '([a-z-]+)',/gm)].map((m) => m[1]);
  const allowed = [...rungs, 'fact'];
  check('every KB entry status is on the axis (or a plain fact)',
    statuses.every((s) => allowed.includes(s)), `saw: ${[...new Set(statuses)].join(',')}`);
  check('no KB entry claims the "In pilot" or "Live" rung',
    !statuses.includes('pilot') && !statuses.includes('live'), `saw: ${statuses.join(',')}`);
  check('the KB header documents the axis it is scored against',
    /ONE LABELLING AXIS/.test(kbSrc) && /Built — in device testing/.test(kbSrc));
}

// ── F. the withdrawn paid tiers (R2) ─────────────────────────────────────────
console.log('\nRATCHET F — no priced plan may be offered while no billing code exists:');
{
  const pricing = JSON.parse(read('src/content/data/pricing.json'));
  const index = read('src/pages/index.astro');
  check('exactly one published tier', pricing.tiers.length === 1, `found ${pricing.tiers.length}`);
  check('it is Free, at 0, forever',
    pricing.tiers[0].name === 'Free' && pricing.tiers[0].price === 0 && pricing.tiers[0].period === 'forever');
  check('its headline is the signed wording, VERBATIM',
    pricing.tiers[0].headline === 'Free — 0 ETB — forever', JSON.stringify(pricing.tiers[0].headline));
  check('the paid tiers are replaced by exactly one line',
    pricing.paidLine === 'Paid plans for larger shops, published when billing opens.', JSON.stringify(pricing.paidLine));
  check('no tier carries a non-zero price', pricing.tiers.every((t) => t.price === 0));
  // F6-D5 (signed): the term-discount rounding language is kept EXACTLY as-is.
  check('the F6-D5 "about 5% / about 10%" rounding language is untouched',
    pricing.note === 'Save with 6-month (about 5%) and annual (about 10%) plans. Customers always use ZAYA free. No hidden fees.',
    JSON.stringify(pricing.note));
  check('no "Most popular" badge (nobody is on any plan — there are no plans)', !/Most popular/.test(index));
  const kbSrc = read('netlify/functions/assistant/kb.mjs');
  const en = kbSrc.split('\n').filter((l) => l.includes('en:')).join('\n');
  for (const price of ['199', '299', '999']) {
    check(`the assistant no longer quotes the withdrawn ${price} ETB tier`, !en.includes(price));
  }
  check('the assistant states the paid-plans line instead',
    /published when billing opens/.test(kbSrc));
}

// ── G. the imagery (R3) ──────────────────────────────────────────────────────
// A picture makes a claim as loudly as a sentence, and none of the ratchets
// above can see one. Ratchet A counts the word "nearby" in COPY; it would not
// have noticed a screenshot with "Found in 4 shops nearby" printed across it.
// This ratchet guards the pixels.
console.log('\nRATCHET G — no fabricated product imagery, and no proximity claim smuggled in as a picture:');
{
  const index = read('src/pages/index.astro');
  const prov = JSON.parse(read('src/assets/screens/_provenance.json'));
  const rights = JSON.parse(read('src/assets/photos/_rights.json'));
  const photoDir = readdirSync(new URL('../src/assets/photos/', import.meta.url));
  const screenDir = readdirSync(new URL('../src/assets/screens/', import.meta.url));

  // G1 — the eight AI photographs are GONE, files and all. A relabel is not a fix:
  // the repo's own rights record named visible Coca-Cola and Nestlé marks.
  const AI_PHOTOS = ['storefront.jpg', 'storefront-wide.jpg', 'counter-sale.jpg', 'supermarket.jpg',
    'stock-check.jpg', 'credit-book.jpg', 'customer-app.jpg', 'diaspora-family.jpg'];
  check('no AI photograph file remains on disk',
    AI_PHOTOS.every((f) => !photoDir.includes(f)), photoDir.join(','));
  check('no image file of any kind remains in src/assets/photos',
    !photoDir.some((f) => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(f)), photoDir.join(','));
  check('the page imports none of them', !/from '\.\.\/assets\/photos/.test(index));
  check('the removal and the trademark reason are RECORDED, not silent',
    rights.photos.length === 0 && !!rights.removed && /Coca-Cola/.test(JSON.stringify(rights.removed)));
  check('the standing "Illustration label + founder decides the trademark" option is recorded and NOT implemented',
    /RECORDED, NOT IMPLEMENTED/.test(rights.standingOptionNotImplemented.status)
    && /Illustration/.test(rights.standingOptionNotImplemented.what));
  check('customer-app.jpg — the fabricated app interface — is named as removed unconditionally',
    /FABRICATED APP INTERFACE/.test(rights.removed.reasons['customer-app.jpg']));

  // G2 — the two proximity baselines never enter this repo. Exact, both ways:
  // 7 screens x 2 languages x 2 text scales.
  for (const n of [4, 8]) {
    check(`no screen${n} baseline was copied in (it renders distances)`,
      !screenDir.some((f) => f.startsWith(`screen${n}_`)), screenDir.filter((f) => f.startsWith(`screen${n}_`)).join(','));
    check(`the page renders no screen${n}`, !new RegExp(`screen${n}_`).test(index));
  }
  const pngs = screenDir.filter((f) => f.endsWith('.png'));
  check('exactly 28 baselines present (7 screens x en/am x 1.25x/1.5625x)', pngs.length === 28, `found ${pngs.length}`);
  check('the provenance file agrees with what is on disk', prov.files === pngs.length && prov.screens.length === 7);
  check('the exclusion of screens 4 and 8 is written down with its reason',
    /nearby/.test(prov.excluded.screen8_price_compare) && /Distance/.test(prov.excluded.screen4_shop_detail));

  // G3 — provenance, not vibes.
  check('provenance names the source repo, path, branch and commit SHA',
    /golden/i.test(prov.sourcePath) && prov.sourceBranch === 'main' && /^[0-9a-f]{40}$/.test(prov.sourceCommit));
  check('provenance asserts the files are unmodified copies',
    /NOT re-rendered/.test(prov.integrity) && /NOT cropped/.test(prov.integrity) && /NOT upscaled/.test(prov.integrity));
  check('the harness artefacts are disclosed, not painted over',
    prov.disclosures.some((d) => /GALLERY CHROME IS BAKED IN/.test(d))
    && prov.disclosures.some((d) => /ICON GLYPHS RENDER AS EMPTY SQUARES/.test(d)));
  check('the page itself tells the reader about both artefacts, not just the repo',
    /pill row along the bottom edge/.test(index) && /empty squares where icons should be/i.test(index));
  // The am baselines are stamped "DRAFT — pending native review" by the app
  // itself. Showing them without saying so would let a machine-authored
  // translation read as a finished one — and cropping the badge off would be
  // the website undoing the app's own honesty.
  check('the Amharic DRAFT badge is disclosed in the record',
    prov.disclosures.some((d) => /AMHARIC BASELINE CARRIES A VISIBLE DRAFT BADGE/.test(d)));
  check('the page explains the Amharic DRAFT badge instead of hoping nobody reads fidel',
    /DRAFT badge, and it is telling the truth/.test(index) && /pending native review/.test(index));

  // G4 — nothing may upscale a 360px baseline into a claim of higher fidelity.
  check('screens are capped at their recorded width and never cover-cropped',
    /\.screen-pair img\{[^}]*max-width:360px/.test(read('src/styles/site.css'))
    && /\.role-media\.is-screen img\{[^}]*object-fit:contain/.test(read('src/styles/site.css')));

  // G5 — the diaspora pane has nothing built, so it shows nothing.
  check('the Planned diaspora pane carries no image at all',
    /data-role-pane="diaspora"[\s\S]*?role-media is-empty/.test(index)
    && !/data-role-pane="diaspora"[\s\S]*?<img/.test(index.slice(index.indexOf('data-role-pane="diaspora"'), index.indexOf('</section>', index.indexOf('data-role-pane="diaspora"')))));
}

console.log(`\n${failures ? `✘ ${failures} claim ratchet(s) failed` : '✔ all claim ratchets passed'}`);
process.exit(failures ? 1 : 0);
