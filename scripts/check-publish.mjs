// F4 BINDING publish gate. Refuses a PRODUCTION build unless the site is marked
// published AND real Privacy + Terms exist (not placeholders). Prevents the site
// from ever being published/indexed without real legal copy (Ethiopian data-
// protection law) or with fake testimonials/partners. Use `build:draft` for
// internal preview builds (which stay noindex).
//
// EXTENDED 2026-08-20 (founder ruling): the gate also asserts the AI ASSISTANT's
// state. The gate that exists must cover the risk that exists — publishing the
// site while an unreviewed AI relay answers the public is a bigger exposure than
// a missing Terms page, and until today nothing checked it. Publish and assistant
// remain INDEPENDENT switches; this gate does not couple them, it only refuses to
// PUBLISH while the assistant would be exposed without the founder's own W-D4b
// approval recorded in src/config/assistant.json.
//
// EXTENDED AGAIN 2026-08-20 (advisory review, publish-blocker): the legal-page
// checks below now also assert that each page's EFFECTIVE DATE is a real date.
// The review found the gate passing at exit 0 while both pages said "Effective
// date: _set at go-live_" — a "real Privacy + Terms page" that says on its face
// it is not in force is not a real one, and every existing check missed it.
import { readFileSync, existsSync } from 'node:fs';
import { assistantState } from '../src/config/assistant-state.mjs';

const fail = (m) => { console.error(`\n✖ publish gate: ${m}\n  (use "npm run build:draft" for a noindex preview build)\n`); process.exit(1); };

// ── DATED FIELDS ON THE LEGAL PAGES ─────────────────────────────────────────
// Both pages open with a line of the shape
//   **Effective date:** <value> · **Last updated:** <value>
// Pull one field's value out of that line: everything after the label up to the
// separator that starts the next field (or the end of the line), with markdown
// emphasis and trailing punctuation stripped. The separator set is middot/bullet/
// pipe/en-dash/em-dash — NOT the ASCII hyphen, which appears inside ISO dates
// (2026-09-01). Returns null when the label is absent at all, which is itself a
// failure for "Effective date".
const datedField = (body, label) => {
  const m = new RegExp(`${label}\\s*:?\\s*\\*{0,2}\\s*([^\\n]*)`, 'i').exec(body);
  if (!m) return null;
  return m[1].split(/[·•|—–]/)[0].replace(/[*_`]/g, '').trim().replace(/[.,;]+$/, '');
};

// Is this value an actual calendar date? POSITIVE test, deliberately: a
// blacklist of placeholder wordings ("set at go-live", "TBD", "at launch",
// "___") only ever catches the phrasings someone thought of, and the next
// author invents a new one. Requiring a real date catches every placeholder by
// construction. A day number is required as well as a year — "July 2026" is not
// a date a policy can take effect on.
const isRealDate = (v) => {
  if (!v) return false;
  const year = v.match(/\b(19|20)\d{2}\b/);
  if (!year) return false;                                   // no year at all
  if (!/\d/.test(v.replace(year[0], ''))) return false;       // year but no day
  return !Number.isNaN(Date.parse(v.replace(/(\d+)(st|nd|rd|th)\b/i, '$1')));
};

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

  // ── THE EFFECTIVE DATE MUST BE SET (publish-blocker, 2026-08-20) ──────────
  // Found by the advisory review and reproduced here: this gate passed, exit 0,
  // with BOTH pages carrying "**Effective date:** _set at go-live_". Nothing
  // above catches it — the phrase contains no "placeholder", no "DRAFT", no
  // "[bracket]", and each file is well over 400 characters — so a publish build
  // would have shipped an indexable site whose Privacy Policy and Terms of Use
  // openly state that they are not yet in force. A policy with no effective
  // date is the one thing a legal page cannot be vague about: it is what a user
  // (or the Ethiopian data-protection regulator) reads to know whether these
  // terms bound the operator on the day their data was collected.
  const effective = datedField(body, 'Effective date');
  if (effective === null) {
    fail(`${legal} has no "Effective date:" line at all — a published policy must state the day it takes effect.`);
  }
  if (!isRealDate(effective)) {
    fail(
      `${legal} has an UNSET effective date: "Effective date: ${effective || '(empty)'}".\n` +
        '    That is a placeholder, not a date, and it says on the published page that the policy is not\n' +
        '    yet in force. Replace it with the real go-live date (e.g. "**Effective date:** 1 September 2026"),\n' +
        `    in src/content/legal/${legal}.md, in the same change that sets published:true.`,
    );
  }
  // Same test for "Last updated" — WHEN PRESENT. It is not required (a page may
  // never have been revised), but a present-and-unset one is the same defect.
  const updated = datedField(body, 'Last updated');
  if (updated !== null && !isRealDate(updated)) {
    fail(`${legal} has an unset "Last updated" date: "${updated || '(empty)'}" — give it a real date or drop the field.`);
  }
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

// ── ONE SWITCH PER DECISION ─────────────────────────────────────────────────
// A second copy of the publish flag is how a "published" site ends up shipping a
// Disallow-everything robots.txt. Refuse a publish build if either retired
// duplicate has come back.
if (existsSync(new URL('../public/robots.txt', import.meta.url))) {
  fail('public/robots.txt is back — a file in public/ shadows the generated /robots.txt route (src/pages/robots.txt.ts) and would ship a stale rule. Delete it.');
}
{
  const legacy = new URL('../src/config/site.ts', import.meta.url);
  if (existsSync(legacy) && /published\s*:/.test(readFileSync(legacy, 'utf8'))) {
    fail('src/config/site.ts declares its own `published` again — src/content/data/site.json is the single source of truth. Remove the duplicate.');
  }
}

// ── THE ASSISTANT'S OWN STATE (founder ruling 2026-08-20) ───────────────────
// Resolve exactly what THIS build would ship, from the same code the layout uses.
const assistant = assistantState(process.env);

// A publish build must not run on an unreadable gate. Off-by-crash is not a
// decision, and an operator cannot see it in the deploy log.
if (!assistant.configOk) {
  fail(`the assistant gate config is unreadable — ${assistant.configReason}. A publish build must not guess; fix src/config/assistant.json.`);
}

// The structural guard: the layout must still consult the gate. A future edit
// that re-mounts <AssistantWidget /> bare would otherwise sail past every flag
// check here, because the flags would be right and the markup would ship anyway.
{
  const base = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
  const mounts = base.split('\n').filter((line) => line.includes('<AssistantWidget'));
  if (mounts.length === 0) fail('src/layouts/Base.astro no longer mounts <AssistantWidget> at all — if that is intended, update this gate.');
  for (const line of mounts) {
    if (!line.includes('assistant.enabled &&')) {
      fail(`src/layouts/Base.astro mounts <AssistantWidget> WITHOUT the gate: "${line.trim()}". The widget must render only behind \`assistant.enabled &&\`.`);
    }
  }
}

// Same guard for the OTHER assistant entry points. `data-open-assistant` is
// handled by a listener that ships inside the widget, so any such control on a
// page where the widget is gated off is a dead button. LIMITATION, stated: this
// is a per-FILE tripwire (does the file gate the assistant at all?), not a proof
// that each individual control sits inside the conditional — it catches a new
// ungated page, not a new ungated button on an already-gated page.
{
  const pageDir = new URL('../src/pages/', import.meta.url);
  for (const file of readdirSync(pageDir)) {
    if (!/\.(astro|md|mdx|html)$/.test(file)) continue;
    const body = readFileSync(new URL(file, pageDir), 'utf8');
    if (body.includes('data-open-assistant') && !body.includes('assistant.enabled')) {
      fail(`src/pages/${file} carries a data-open-assistant control but never consults the assistant gate — it would ship a button that does nothing.`);
    }
  }
}

// The relay's access gate must still be the first thing the handler does.
{
  const relay = readFileSync(new URL('../netlify/functions/assistant/assistant.mjs', import.meta.url), 'utf8');
  for (const needle of ['assistantGateState(', 'tokenMatches(']) {
    if (!relay.includes(needle)) {
      fail(`netlify/functions/assistant/assistant.mjs no longer calls ${needle} — the endpoint would be open to the internet again.`);
    }
  }
}

// The flag assertion itself. NOTE what is and is not coupled: a publish build
// with the assistant OFF passes (the assistant is simply not there); a publish
// build with the assistant ON passes ONLY with the founder's recorded approval.
if (assistant.enabled) {
  if (!assistant.detail.publicLaunchApproved) {
    fail(
      'the ASSISTANT would be EXPOSED on a published site without the founder\'s gate.\n' +
        `    resolved: enabled=true (${assistant.reason})\n` +
        '    but src/config/assistant.json publicLaunchApproved is not true (W-D4b, the public-launch\n' +
        '    ruling, is the founder\'s and has not been recorded). Either set publicLaunchApproved:true\n' +
        '    in that file (founder\'s decision, in a commit), or turn the assistant off for this build\n' +
        '    (assistant.json enabled:false, or ZAYA_ASSISTANT=off).',
    );
  }
  console.log('⚠ publish gate: assistant is ON for this build and W-D4b approval IS recorded (publicLaunchApproved:true). The AI relay will answer the public.');
} else {
  console.log(`✓ publish gate: assistant OFF for this build — ${assistant.reason}`);
}

// (Also refuse any testimonial/partner still flagged placeholder in a publish build.)
console.log('✓ publish gate passed: published=true, real Privacy + Terms present with set effective dates, all photo rights confirmed, assistant state asserted.');
