// DRAFT-BUILD guard — the other half of scripts/check-publish.mjs.
//
// THE HOLE THIS CLOSES. `build:draft` exists to skip the publish gate, which is
// correct while the site is PARKED: the output is noindex by construction, so
// there is nothing for the gate to protect. But "skips the gate" was
// unconditional. Flip site.json published to true and `build:draft` would have
// cheerfully emitted an INDEXABLE site — allow-everything /robots.txt, no
// noindex meta — with check-publish.mjs never having run: no legal-copy check,
// no photo-rights check, no assistant-state check. The draft path was a way
// around the gate that grew a way to publish.
//
// THE RULE, and it is the whole point of this file:
//   NO BUILD PATH MAY PRODUCE AN INDEXABLE SITE WITHOUT THE FULL GATE PASSING.
// Enforced as a pair, and the two are exhaustive over `published`:
//   published=false -> `build:draft` only. This guard passes; the output is
//                      noindex + Disallow. `build` refuses (check-publish).
//   published=true  -> `build` only. This guard REFUSES; check-publish runs the
//                      real gate.
// So the indexable output has exactly one producer, and it is the gated one.
//
// This does NOT touch check-publish.mjs or weaken any assertion in it. It is a
// second, opposite-facing member of the same family, in the same style, with
// the same exit conventions.
import { readFileSync } from 'node:fs';

const fail = (m) => { console.error(`\n✖ draft gate: ${m}\n  (use "npm run build" for a real, gated publish build)\n`); process.exit(1); };

// Same single source of truth as the <head> robots meta (src/layouts/Base.astro),
// the generated /robots.txt route (src/pages/robots.txt.ts) and the publish gate.
// Read it the same way they do — a fourth consumer, not a fourth switch.
let site;
try {
  site = JSON.parse(readFileSync(new URL('../src/content/data/site.json', import.meta.url), 'utf8'));
} catch (e) {
  // Fail closed. An unreadable flag is not permission to build something that
  // might be indexable.
  fail(`src/content/data/site.json could not be read (${e.message}) — a draft build must not guess whether this site is parked.`);
}

if (site.published === true) {
  fail(
    'site.json published is TRUE — a draft build would emit an INDEXABLE site with no gate having run.\n' +
      '    A draft build is only meaningful while the site is parked: it skips scripts/check-publish.mjs,\n' +
      '    so at published=true it would ship an allow-everything /robots.txt and no noindex meta without\n' +
      '    ever checking Privacy/Terms, photo rights, or the assistant\'s state.\n' +
      '    Publishing is a gated act: run "npm run build" and satisfy the publish gate. If you did NOT mean\n' +
      '    to publish, set published back to false in src/content/data/site.json.',
  );
}

console.log('✓ draft gate passed: site is parked (published=false) — this build is noindex + Disallow by construction.');
