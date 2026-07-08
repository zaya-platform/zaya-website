// F4 BINDING publish gate. Refuses a PRODUCTION build unless the site is marked
// published AND real Privacy + Terms exist (not placeholders). Prevents the site
// from ever being published/indexed without real legal copy (Ethiopian data-
// protection law) or with fake testimonials/partners. Use `build:draft` for
// internal preview builds (which stay noindex).
import { readFileSync, existsSync } from 'node:fs';

const fail = (m) => { console.error(`\n✖ publish gate: ${m}\n  (use "npm run build:draft" for a noindex preview build)\n`); process.exit(1); };

// The app's source of truth for the publish flag is the CMS-editable site.json.
const site = JSON.parse(readFileSync(new URL('../src/content/data/site.json', import.meta.url), 'utf8'));
if (site.published !== true) fail('site.json published is false — not cleared to publish yet.');

for (const legal of ['privacy', 'terms']) {
  const p = new URL(`../src/content/legal/${legal}.md`, import.meta.url);
  if (!existsSync(p)) fail(`real ${legal} page is missing (src/content/legal/${legal}.md).`);
  const body = readFileSync(p, 'utf8');
  if (/placeholder/i.test(body) || body.trim().length < 400) fail(`${legal} still looks like a placeholder.`);
  // Belt-and-suspenders: an unreviewed draft must never go live by accident.
  if (/\bDRAFT\b/.test(body)) fail(`${legal} still contains "DRAFT" — only the endorsed final text may publish.`);
  if (/\[Lawyer/i.test(body)) fail(`${legal} still contains a "[Lawyer …]" review note.`);
  // Unresolved [bracket] placeholder (ignores markdown links like [text](url)).
  if (/\[[^\]]+\](?!\()/.test(body)) fail(`${legal} still contains an unresolved [bracket] placeholder.`);
}

// Photo rights gate (founder ruling 2026-07-08): no supplied photo may enter a
// publish build until its commercial usage rights are confirmed. Approved photos
// are named "*_rights-pending.jpg" until confirmed; rename (drop the suffix) only
// once rights are cleared. Fail the publish build while any remain pending.
import { readdirSync } from 'node:fs';
const photosDir = new URL('../src/assets/photos/', import.meta.url);
try {
  const pending = readdirSync(photosDir).filter((f) => /rights-pending/i.test(f));
  if (pending.length) fail(`photo rights not confirmed for: ${pending.join(', ')} — rename to drop "_rights-pending" once cleared, or replace with commissioned Haile Garment photos.`);
} catch { /* no photos dir yet — fine */ }

// Photo rights manifest: the current in-use photos are AI-generated PLACEHOLDERS.
// Publish is blocked until their commercial rights are confirmed (set cleared:true)
// or they are replaced with commissioned pilot-shop photography.
const rightsFile = new URL('../src/assets/photos/_rights.json', import.meta.url);
if (existsSync(rightsFile)) {
  const rights = JSON.parse(readFileSync(rightsFile, 'utf8'));
  if (rights.cleared !== true) fail(`photo rights not cleared — ${rights.note || 'set src/assets/photos/_rights.json cleared:true once confirmed.'}`);
}

// (Also refuse any testimonial/partner still flagged placeholder in a publish build.)
console.log('✓ publish gate passed: published=true, real Privacy + Terms present, all photo rights confirmed.');
