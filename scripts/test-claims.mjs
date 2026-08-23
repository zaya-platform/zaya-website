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

// ── G. the imagery ───────────────────────────────────────────────────────────
// A picture makes a claim as loudly as a sentence, and none of the ratchets
// above can see one. Ratchet A counts the word "nearby" in COPY; it would not
// have noticed a screenshot with "Found in 4 shops nearby" printed across it.
// This ratchet guards the pixels.
//
// DELIBERATE CATALOGUE UPDATE, 2026-08-23 (the demo rework). Two rulings moved
// the ground under G and the counts move WITH them, deliberately:
//  · A4 — the founder EXECUTED the standing option the truth pass recorded:
//    the persona photos return, each with a visible on-page "Illustration"
//    chip and its trademark question resolved per file. Two of the three ship
//    (credit-book, diaspora-family — pixel-inspected, no readable mark,
//    nothing altered); customer-app.jpg stays OUT on the ruling's own escape
//    clause (unremovable NIDO marks + it is the fabricated app interface).
//  · A3 — the page now shows REAL-APP CAPTURES (src/assets/demo, icons
//    present) inside the interactive demo; the golden baselines stay in the
//    repo as the reference record but no longer render on the public page.
//    KNOWN AND FLAGGED, not hidden: the browse and compare captures contain
//    the APP'S OWN proximity wording in pixels ("Shops near you", "Browse
//    near", "across nearby shops"). That is the platform's copy (its QF4
//    wording domain) photographed unretouched — cropping it would be
//    retouching. The SITE's own words remain bound by ratchets A–C, and G7
//    below holds every caption and alt this page authors to the same ban.
console.log('\nRATCHET G — imagery: labelled illustrations, real captures, no proximity claim in SITE-authored words:');
{
  const index = read('src/pages/index.astro');
  const css = read('src/styles/site.css');
  const prov = JSON.parse(read('src/assets/screens/_provenance.json'));
  const demoProv = JSON.parse(read('src/assets/demo/_provenance.json'));
  const rights = JSON.parse(read('src/assets/photos/_rights.json'));
  const photoDir = readdirSync(new URL('../src/assets/photos/', import.meta.url));
  const screenDir = readdirSync(new URL('../src/assets/screens/', import.meta.url));
  const demoDir = readdirSync(new URL('../src/assets/demo/', import.meta.url));

  // G1 — the persona-photo ruling, implemented EXACTLY: two restored, six out.
  const RESTORED = ['credit-book.jpg', 'diaspora-family.jpg'];
  const STILL_GONE = ['storefront.jpg', 'storefront-wide.jpg', 'counter-sale.jpg',
    'supermarket.jpg', 'stock-check.jpg', 'customer-app.jpg'];
  const photoImages = photoDir.filter((f) => /\.(jpe?g|png|webp|avif|gif|svg)$/i.test(f));
  check('exactly the two ruled photos are on disk, nothing else',
    photoImages.length === 2 && RESTORED.every((f) => photoImages.includes(f)), photoImages.join(','));
  check('the six unrestored photos stay gone (customer-app.jpg included)',
    STILL_GONE.every((f) => !photoDir.includes(f)), photoDir.join(','));
  check('the page imports exactly the two ruled photos',
    (index.match(/from '\.\.\/assets\/photos\//g) || []).length === 2
    && /photos\/credit-book\.jpg/.test(index) && /photos\/diaspora-family\.jpg/.test(index)
    && !/photos\/customer-app/.test(index));
  check('each restored photo carries a visible Illustration chip, localized (EN + አማ)',
    (index.match(/class="ill-chip"/g) || []).length === 2
    && (index.match(/>Illustration</g) || []).length === 2
    && (index.match(/ምሳሌያዊ ምስል/g) || []).length === 2);
  check('every shipped photo has a structured rights record: illustration:true + trademarks resolved',
    RESTORED.every((f) => {
      const r = (rights.photos || []).find((p) => p.file === f);
      return r && r.illustration === true && r.trademarks && r.trademarks.status === 'resolved'
        && /pixel/i.test(r.trademarks.inspection) && /NOTHING/.test(r.trademarks.altered);
    }));
  check('customer-app.jpg is recorded LEFT OUT on both grounds (NIDO + fabricated interface)',
    !!rights.leftOut && /NIDO/.test(JSON.stringify(rights.leftOut['customer-app.jpg']))
    && /FABRICATED app interface/i.test(JSON.stringify(rights.leftOut['customer-app.jpg'])));
  check('the alt text of each restored photo says what it is NOT (no photo of a ZAYA shop / delivered order)',
    /AI-generated illustration, not a photograph of a ZAYA shop/.test(index)
    && /AI-generated illustration of the planned diaspora basket, not a photograph of a delivered order/.test(index));

  // G2 — the two proximity baselines never enter this repo. Exact, both ways:
  // 7 screens x 2 languages x 2 text scales. And the baselines as a whole have
  // LEFT the public page (they remain in the repo as the reference record).
  for (const n of [4, 8]) {
    check(`no screen${n} baseline was copied in (it renders distances)`,
      !screenDir.some((f) => f.startsWith(`screen${n}_`)), screenDir.filter((f) => f.startsWith(`screen${n}_`)).join(','));
    check(`the page renders no screen${n}`, !new RegExp(`screen${n}_`).test(index));
  }
  const pngs = screenDir.filter((f) => f.endsWith('.png'));
  check('exactly 28 baselines still present in the repo record (7 screens x en/am x 2 scales)', pngs.length === 28, `found ${pngs.length}`);
  check('the provenance file agrees with what is on disk', prov.files === pngs.length && prov.screens.length === 7);
  check('the exclusion of screens 4 and 8 is written down with its reason',
    /nearby/.test(prov.excluded.screen8_price_compare) && /Distance/.test(prov.excluded.screen4_shop_detail));
  check('the golden baselines no longer render on the public page (nothing imports them)',
    !/from '\.\.\/assets\/screens/.test(index));

  // G3 — the demo captures: provenance, not vibes.
  const demoPngs = demoDir.filter((f) => f.endsWith('.png'));
  check('exactly 18 captures on disk (9 screens x en/am)', demoPngs.length === 18, `found ${demoPngs.length}`);
  check('every capture on disk is named in the capture provenance',
    demoPngs.every((f) => demoProv.files && !!demoProv.files[f]), demoPngs.filter((f) => !demoProv.files?.[f]).join(','));
  check('the page renders all 18 captures (both languages of all 9 screens ship in the HTML)',
    demoPngs.every((f) => index.includes(f.replace('.png', ''))));
  check('capture provenance names the platform commit and states the icons are PRESENT',
    /^[0-9a-f]{7,40}$/.test(demoProv.platform_commit) && /PRESENT/.test(demoProv.icons));
  check('the page discloses the seeded data in visitor voice',
    /seeded demo data, not pilot data/.test(index) && /unretouched/.test(index));
  // The Amharic translation is machine-authored, pending native review; the
  // captures carry no baked-in badge, so the SITE adds the chip — one per
  // step's phone screen — and explains it in plain words.
  // Source-level count: the chip is authored once per stepper TEMPLATE (inside
  // the .map over steps), so 2 in source = one chip on every one of the 9
  // rendered steps' phones. It sits inside .phone-screen, over the shot.
  check('every step\'s phone carries the site-side ረቂቅ/DRAFT chip (once per stepper template, inside the screen)',
    (index.match(/class="draft-chip"/g) || []).length === 2
    && (index.match(/<div class="phone-screen">[\s\S]*?class="draft-chip"/g) || []).length === 2,
    `found ${(index.match(/class="draft-chip"/g) || []).length}`);
  check('the DRAFT chip is gated to the Amharic screens by the language toggle (CSS)',
    /\.draft-chip\{display:none/.test(css) && /#dlang-am:checked~\.role-explorer \.draft-chip\{display:inline-flex\}/.test(css));
  check('the page explains the draft mark instead of hoping nobody reads fidel',
    /machine-authored and awaits native review/.test(index) && /ረቂቅ/.test(index));

  // G4 — nothing may upscale a 360px-recorded screen into a claim of higher
  // fidelity, cover-crop it, tint it, or hover-zoom it.
  check('demo screens are capped at their recorded CSS width and never cover-cropped',
    /\.phone-screen img\{[^}]*max-width:360px/.test(css) && /\.phone-screen img\{[^}]*object-fit:contain/.test(css));
  check('the demo media neutralises the photo treatment (no tint, no hover zoom)',
    /\.role-media\.is-demo::after\{content:none\}/.test(css)
    && /\.role-pane:hover \.role-media\.is-demo img\{transform:none\}/.test(css));

  // G5 — the diaspora pane still shows NO product screens (nothing is built);
  // what it carries is its ruled illustration, chip-labelled, with the Planned
  // pill kept and an on-image caption saying what the picture is not.
  {
    const pane = index.slice(index.indexOf('data-role-pane="diaspora"'), index.indexOf('</article>', index.indexOf('data-role-pane="diaspora"')));
    check('the diaspora pane contains no app capture and no demo stepper',
      !/assets\/demo/.test(pane) && !/data-demo/.test(pane) && !/class="phone"/.test(pane));
    check('the diaspora pane keeps the Planned pill AND labels its illustration',
      /class="role-status planned">Planned</.test(pane) && /class="ill-chip"/.test(pane)
      && /illustrates the plan/.test(pane) && /not a delivered order/i.test(pane));
  }

  // G7 — SITE-authored words about the imagery stay inside the proximity ban.
  // (The captions/alts are this site's voice; the pixels are the platform's.)
  const capText = [...index.matchAll(/\b(?:t|c|alt):\s*'([^']*)'/g)].map((m) => m[1]).join(' ');
  check('no demo caption, title or alt uses "nearby" / "near you" / "shops near"',
    !/nearby|near you|shops near|near me/i.test(capText), capText.match(/[^ ]*near[^ ]*/gi)?.join(',') || '');
}

console.log(`\n${failures ? `✘ ${failures} claim ratchet(s) failed` : '✔ all claim ratchets passed'}`);
process.exit(failures ? 1 : 0);
