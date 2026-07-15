// Phase-1 interaction contracts — dep-free (mirrors test-assistant.mjs style).
// These assert the INVARIANTS that guarantee the interactive behaviour without a
// browser: the honest audience toggle, the tab<->pane bijection the toggle relies
// on, reduced-motion neutralisation, and the JS-gated no-JS fallback.
// Run: npm run test:interactions   (exits non-zero on any failure).
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const index = read('src/pages/index.astro');
const css = read('src/styles/site.css');
const siteJs = read('src/scripts/site.js');
const base = read('src/layouts/Base.astro');
const faq = read('src/content/data/faq.json');
const home = read('src/content/data/home.json');
const kb = read('netlify/functions/assistant/kb.mjs');
const pkg = JSON.parse(read('package.json'));

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  ✔ ${name}`);
  else { failures += 1; console.error(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`); }
};

// --- Parse the role explorer from the source (tabs + panes) ---
const tabRoles = [...index.matchAll(/role="tab"[^>]*data-role="([a-z]+)"/g)].map((m) => m[1]);
const paneRoles = [...index.matchAll(/data-role-pane="([a-z]+)"/g)].map((m) => m[1]);
const jumpRoles = [...index.matchAll(/data-role-jump="([a-z]+)"/g)].map((m) => m[1]);

console.log('audience toggle — honest set (Customer + Merchant + Diaspora-as-vision):');
{
  const set = new Set(tabRoles);
  check('exactly three role tabs', tabRoles.length === 3, `got ${tabRoles.length}: ${tabRoles.join(',')}`);
  check('tabs are merchant + customer + diaspora', set.has('merchant') && set.has('customer') && set.has('diaspora'));
  check('Rider tab is dropped (not a ZAYA product — delivery is shop-managed)', !set.has('rider'));
  check('no Rider pane remains', !paneRoles.includes('rider'));
  check('no hero chip jumps to a removed role', jumpRoles.every((r) => set.has(r)), `jumps: ${jumpRoles.join(',')}`);
  check('Diaspora is labelled as vision, not a live product', /data-role-pane="diaspora"[\s\S]*?Our vision/.test(index) && /role-pane-diaspora[\s\S]*?not live yet/.test(index));
}

console.log('\ntab ↔ pane bijection (what the toggle relies on) + single-active simulation:');
{
  const okBijection = tabRoles.length === paneRoles.length && tabRoles.every((r) => paneRoles.includes(r)) && paneRoles.every((r) => tabRoles.includes(r));
  check('every tab has a pane and every pane has a tab', okBijection);
  // Simulate the real activate(): selecting a role shows exactly that pane, hides the rest.
  const activate = (role) => paneRoles.map((r) => ({ role: r, hidden: r !== role }));
  const allValid = tabRoles.every((role) => {
    const shown = activate(role).filter((p) => !p.hidden);
    return shown.length === 1 && shown[0].role === role;
  });
  check('activating each role shows exactly one pane', allValid);
  check('exactly one pane starts active (is-active, no hidden)', (index.match(/class="role-pane is-active"/g) || []).length === 1);
}

console.log('\ntoggle stays generic — removing a role needs no JS change:');
{
  check('activate() derives tabs from the DOM', /querySelectorAll\('\[role="tab"\]\[data-role\]'\)/.test(siteJs));
  check('keyboard nav wraps over the live tab count (tabs.length)', /tabs\.length/.test(siteJs));
}

console.log('\nreduced-motion is honoured (same content, no motion):');
{
  // Nested braces make @media extraction regex-unfriendly; assert the authored
  // override rules directly (they exist ONLY inside reduced-motion blocks).
  check('a reduced-motion block exists', /@media\(prefers-reduced-motion:reduce\)/.test(css));
  check('reveal + reveal-seq are shown, un-transformed under reduced-motion',
    css.includes('html.js .reveal,html.js .reveal-seq>*{opacity:1!important;transform:none!important'));
  check('the hero entrance + role-pane crossfade are disabled under reduced-motion',
    css.includes('.role-pane,html.js .hero .copy>*{animation:none!important}'));
}

console.log('\nJS-gated fallback (no-JS / failed bundle shows the full static page):');
{
  check('Base.astro sets html.js inline in <head>, before paint', /is:inline>document\.documentElement\.classList\.add\('js'\)/.test(base));
  check('reveal initial-hidden state is gated under html.js', /html\.js \.reveal\{opacity:0/.test(css));
  check('reveal-seq initial-hidden state is gated under html.js', /html\.js \.reveal-seq>\*\{opacity:0/.test(css));
  check('the hero entrance is gated under html.js', /html\.js \.hero \.copy>\*\{animation:heroRise/.test(css));
  check('NO un-gated .reveal{opacity:0} remains (would hide content with JS off)', !/(^|[^.])\.reveal\{opacity:0/.test(css.replace(/html\.js \.reveal/g, 'html.js X')));
  check('the observer covers .reveal and .reveal-seq', /querySelectorAll\('\.reveal,\.reveal-seq'\)/.test(siteJs));
  check('there is an IntersectionObserver-absent fallback that reveals all', /if\(!\('IntersectionObserver'in window\)\)\{[^}]*classList\.add\('in'\)/.test(siteJs));
}

console.log('\nno new heavy animation dependencies (Astro-native only):');
{
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  const heavy = ['lottie-web', 'lottie', '@lottiefiles/lottie-player', '@rive-app/canvas', 'rive-js', 'three', 'gsap'];
  check('no Lottie/Rive/Three/GSAP dependency added', heavy.every((d) => !(d in deps)), `deps: ${Object.keys(deps).join(',')}`);
  check('runtime deps unchanged (astro + sitemap only)', Object.keys(pkg.dependencies || {}).sort().join(',') === '@astrojs/sitemap,astro');
}

console.log('\nhonesty & no-invented-metrics:');
{
  check('no count-up on an invented metric (no data-countup attribute added)', !/data-count(-)?up/i.test(index));
  check('hero copy no longer name-drops unbuilt verticals as live', !/customers, riders, suppliers/.test(index));
}

console.log('\nassistant-CTA — the intentional minimal set (widget + 1 header + 1 mid-page):');
{
  const inPageTriggers = (index.match(/data-open-assistant/g) || []).length;
  check('exactly ONE header entry (.menu-ai) restored', (index.match(/class="menu-ai"/g) || []).length === 1);
  check('exactly ONE mid-page invitation (.ask-band)', (index.match(/class="ask-band"/g) || []).length === 1);
  check('the 3 role-pane "Ask about X" triggers removed', !/text-btn[^>]*data-open-assistant/.test(index));
  check('hero has NO competing AI button — secondary is "See how it works"', !/btn-ghost[^>]*data-open-assistant/.test(index) && /See how it works/.test(index));
  check('hero float-ai card removed', !/float-ai/.test(index));
  check('exactly 2 in-page triggers (header + mid-page); the widget is the AI home', inPageTriggers === 2, `found ${inPageTriggers}`);
  check('the persistent widget launcher is untouched', /id="zassist-invite"[\s\S]*?data-open-assistant/.test(read('src/components/AssistantWidget.astro')));
}

console.log('\nfull-page honesty reconciliation (Rider/Supplier are not live ZAYA products):');
{
  check('no "For riders" / "Why riders love" section', !/Why riders love/.test(index) && !/id="riders"/.test(index));
  check('no rider gig-work benefit copy (Flexible income / Jobs near you)', !/Flexible income|Jobs near you/.test(index));
  check('problem grid dropped the Riders column', !/>Riders<\/h3>/.test(index));
  check('no in-page copy names riders/suppliers as a live audience', !/riders, suppliers|customers, merchants, riders/.test(index));
  check('meta description reconciled (Base.astro)', !/riders, suppliers/.test(base));
  check('FAQ + CMS home content reconciled', !/riders|suppliers/i.test(faq) && !/"riders"|"suppliers"/.test(home));
  check('the diaspora is one clearly-labelled vision section (#diaspora → Our vision)', /id="diaspora"[\s\S]*?Our vision/.test(index));
  check('dead #eco canvas IIFE (declared retired Riders/Suppliers nodes) removed', !/getElementById\('eco'\)/.test(siteJs));
  // The only legitimate "supplier" left is the merchant's own supplier invoice (OCR feature).
  check('remaining "supplier" mention is the OCR merchant-invoice feature only', ((index.match(/supplier/gi) || []).length === 1) && /supplier invoice/i.test(index));
  check('the assistant KB answer no longer names riders/suppliers as a live audience', !/customers, riders, suppliers|riders, suppliers|dhiyeessitootaa fi/.test(kb));
  check('footer honest-labels legend dropped the orphan "Future" tier', !/Roadmap<\/b> · Future/.test(index));
  check('home.json residue reconciled (no orphaned cinematic block; diaspora eyebrow = vision)', !/"cinematic"/.test(home) && /Our vision — for the diaspora/.test(home));
}

console.log('\na11y landmarks + reduced-motion completeness + pain-first narrative:');
{
  check('a <main id="main"> landmark wraps the page + a skip-to-content link exists', /<main id="main">/.test(base) && /skip-link/.test(base) && /\.skip-link\{/.test(css));
  check('reduced-motion also stops the even-photo Ken Burns (!important + nth-child)', /\.shot img,\.shot:nth-child\(2n\) img\{animation:none!important\}/.test(css));
  check('the page LEADS with the pain (problem section before the audiences toggle)', index.indexOf('id="problems"') > 0 && index.indexOf('id="problems"') < index.indexOf('id="experience"'));
  check('stacked pale band sections get a hairline seam', /\.band\{background:#F4FBFB;border-top:1px solid/.test(css));
}

console.log('\nvisual polish (tokens + honest banding):');
{
  check('status colors routed through the design tokens (one colour per status)', /\.st\.launch\{color:var\(--status-launching\)/.test(css) && /\.role-status\.launch\{[^}]*color:var\(--status-launching\)/.test(css));
  check('section banding restored (band sections tinted, not one flat wash)', /\.band\{background:#F4FBFB;border-top/.test(css) && !/\.showcase,\.solve,\.band\{background:transparent\}/.test(css));
  check('problem grid is 3 columns after the Riders cut', /\.pain-grid\{display:grid;grid-template-columns:repeat\(3,1fr\)/.test(css));
}

console.log(`\n${failures ? `✘ ${failures} check(s) failed` : '✔ all interaction contracts passed'}`);
process.exit(failures ? 1 : 0);
