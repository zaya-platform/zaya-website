// Pins the SEPARATING ASSISTANT GATE (founder ruling 2026-08-20).
// Run: npm run test:gate   (exits non-zero on any failure)
//
// This is the executable half of the design. It proves, without Netlify and
// without a deploy:
//   I5  every missing/malformed/ambiguous input resolves the assistant OFF
//   I3  the relay refuses unauthenticated calls, and refuses everyone when it
//       is not configured
//   I1  neither switch can see the other (publish is not an input anywhere)
//   I6  the SHIPPED config resolves OFF
// House pattern: a plain node script like scripts/test-assistant.mjs, wired
// into `npm test`.

import { readFileSync } from 'node:fs';
import { MIN_TOKEN_CHARS, isUsableToken, parseAssistantConfig, resolveAssistant } from '../src/config/assistant.mjs';
import { assistantState } from '../src/config/assistant-state.mjs';
import {
  ASSISTANT_TOKEN_HEADER,
  assistantGateState,
  isUsableToken as serverIsUsableToken,
  presentedToken,
  tokenMatches,
} from '../netlify/functions/assistant/guard.mjs';
import { handler } from '../netlify/functions/assistant/assistant.mjs';

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  ✔ ${name}`);
  else {
    failures += 1;
    console.error(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const GOOD_TOKEN = 'A'.repeat(MIN_TOKEN_CHARS); // shape-valid, not a real secret
const ON = { enabled: true };
const OFF = { enabled: false };

// ── I5: FAIL-CLOSED ─────────────────────────────────────────────────────────
console.log('I5 fail-closed — every unclear input resolves OFF:');
{
  const offCases = [
    ['no config at all', { config: null, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['config is undefined', { config: undefined, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['config is an array', { config: [], env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['config is a string', { config: 'enabled', env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['enabled missing', { config: {}, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['enabled is the STRING "true"', { config: { enabled: 'true' }, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['enabled is 1', { config: { enabled: 1 }, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['enabled is "yes"', { config: { enabled: 'yes' }, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['enabled true but NO token', { config: ON, env: {} }],
    ['enabled true, token too short', { config: ON, env: { ZAYA_ASSISTANT_TOKEN: 'A'.repeat(MIN_TOKEN_CHARS - 1) } }],
    ['enabled true, token has a space', { config: ON, env: { ZAYA_ASSISTANT_TOKEN: `${'A'.repeat(30)} x` } }],
    ['enabled true, token is a number', { config: ON, env: { ZAYA_ASSISTANT_TOKEN: 12345678901234567890123456 } }],
    ['env switch is "true" (not on/off)', { config: OFF, env: { ZAYA_ASSISTANT: 'true', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env switch is "1"', { config: ON, env: { ZAYA_ASSISTANT: '1', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env switch is a typo "onn"', { config: ON, env: { ZAYA_ASSISTANT: 'onn', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env kill switch beats config:true', { config: ON, env: { ZAYA_ASSISTANT: 'off', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env kill switch beats env on', { config: OFF, env: { ZAYA_ASSISTANT: 'OFF', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env on but no token', { config: OFF, env: { ZAYA_ASSISTANT: 'on' } }],
    ['nothing at all', { config: null, env: {} }],
  ];
  for (const [name, input] of offCases) {
    const r = resolveAssistant(input);
    check(`OFF: ${name}`, r.enabled === false && r.token === null, `got enabled=${r.enabled}`);
  }
  check('resolveAssistant() with no arguments is OFF', resolveAssistant().enabled === false);

  const onCases = [
    ['committed enabled:true + usable token', { config: ON, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env on + usable token (config false)', { config: OFF, env: { ZAYA_ASSISTANT: 'on', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
    ['env on with padding/case', { config: OFF, env: { ZAYA_ASSISTANT: ' On ', ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } }],
  ];
  for (const [name, input] of onCases) {
    const r = resolveAssistant(input);
    check(`ON: ${name}`, r.enabled === true && r.token === GOOD_TOKEN, `got enabled=${r.enabled}`);
  }
}

console.log('I5 malformed config FILES resolve OFF (never crash, never ON):');
{
  for (const [name, text] of [
    ['missing file (null)', null],
    ['empty file', ''],
    ['truncated JSON', '{"enabled": tru'],
    ['JSON array', '[{"enabled":true}]'],
    ['JSON literal true', 'true'],
    ['not JSON at all', 'enabled = true'],
  ]) {
    const parsed = parseAssistantConfig(text);
    const r = resolveAssistant({ config: parsed.config, env: { ZAYA_ASSISTANT_TOKEN: GOOD_TOKEN } });
    check(`OFF: ${name}`, parsed.ok === false && r.enabled === false, `ok=${parsed.ok} enabled=${r.enabled}`);
  }
  const parsedGood = parseAssistantConfig('{"enabled": true}');
  check('a well-formed file still parses', parsedGood.ok === true && parsedGood.config.enabled === true);
}

// ── I6: what this repo actually SHIPS ───────────────────────────────────────
console.log('I6 the committed configuration ships the assistant OFF:');
{
  const shipped = assistantState({}); // no env → committed config alone decides
  check('assistantState({}) is OFF', shipped.enabled === false, shipped.reason);
  check('the committed config file is readable', shipped.configOk === true, shipped.configReason);
  const raw = JSON.parse(readFileSync(new URL('../src/config/assistant.json', import.meta.url), 'utf8'));
  check('assistant.json enabled is exactly false', raw.enabled === false);
  check('assistant.json publicLaunchApproved is exactly false (W-D4b ungranted)', raw.publicLaunchApproved === false);
}

// ── I1: the two switches cannot see each other ──────────────────────────────
console.log('I1 publish is not an input to the assistant gate:');
{
  const src = readFileSync(new URL('../src/config/assistant.mjs', import.meta.url), 'utf8');
  const state = readFileSync(new URL('../src/config/assistant-state.mjs', import.meta.url), 'utf8');
  const relay = readFileSync(new URL('../netlify/functions/assistant/assistant.mjs', import.meta.url), 'utf8');
  const guard = readFileSync(new URL('../netlify/functions/assistant/guard.mjs', import.meta.url), 'utf8');
  // Comments legitimately DISCUSS the publish flag — explaining the separation is
  // the point of the ruling. Strip comments and test the CODE.
  const codeOnly = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
  const mentionsPublishFlag = (text) => /site\.json|site\.published|\bpublished\b\s*[:=]/.test(codeOnly(text));
  check('src/config/assistant.mjs never reads the publish flag', !mentionsPublishFlag(src));
  check('src/config/assistant-state.mjs never reads the publish flag', !mentionsPublishFlag(state));
  check('the relay never reads the publish flag', !mentionsPublishFlag(relay));
  check('guard.mjs never reads the publish flag', !mentionsPublishFlag(guard));
  // and the reverse direction: the publish consumers must not read the assistant flag
  const robots = readFileSync(new URL('../src/pages/robots.txt.ts', import.meta.url), 'utf8');
  check('/robots.txt never reads the assistant flag', !/assistant\.json|ZAYA_ASSISTANT/.test(robots));
}

// ── no drift between the two copies of the token rule ───────────────────────
console.log('the client-side and server-side token rules agree:');
{
  const table = [
    GOOD_TOKEN, 'A'.repeat(MIN_TOKEN_CHARS - 1), 'A'.repeat(64), '', ' ', 'has space '.repeat(4),
    'a-b_C9'.repeat(6), 'token"with"quotes-padded-to-length', 'ü'.repeat(40), 'A'.repeat(30) + '\n',
    undefined, null, 12345, {}, [],
  ];
  let agree = true;
  for (const v of table) if (isUsableToken(v) !== serverIsUsableToken(v)) agree = false;
  check(`isUsableToken agrees across src/config and netlify/functions on ${table.length} inputs`, agree);
  check('MIN_TOKEN_CHARS is enforced identically', isUsableToken('A'.repeat(MIN_TOKEN_CHARS)) && !serverIsUsableToken('A'.repeat(MIN_TOKEN_CHARS - 1)));
}

// ── I3: the relay refuses unauthenticated callers ───────────────────────────
console.log('I3 the relay rejects unauthenticated calls, in every configuration:');
{
  const SECRET = 'zaya-preview-secret-token-0123456789'; // gitleaks:allow (fixture, not a credential)
  let ip = 0;
  const call = async ({ headers = {}, method = 'POST', body = { message: 'What is ZAYA?', locale: 'en' } } = {}) => {
    const res = await handler({
      httpMethod: method,
      headers: { 'x-nf-client-connection-ip': `198.51.100.${++ip}`, ...headers },
      body: JSON.stringify(body),
    });
    return { status: res.statusCode, ...(JSON.parse(res.body || '{}')) };
  };
  const withEnv = async (env, fn) => {
    const saved = { ZAYA_ASSISTANT: process.env.ZAYA_ASSISTANT, ZAYA_ASSISTANT_TOKEN: process.env.ZAYA_ASSISTANT_TOKEN };
    for (const k of ['ZAYA_ASSISTANT', 'ZAYA_ASSISTANT_TOKEN']) {
      if (env[k] === undefined) delete process.env[k];
      else process.env[k] = env[k];
    }
    try { return await fn(); } finally {
      for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
    }
  };

  // 1. UNCONFIGURED (this is production's state, and the state of every deploy
  //    that has not been given the secret): closed to EVERYONE.
  await withEnv({}, async () => {
    const anon = await call();
    check('no token configured → 503 for an anonymous caller', anon.status === 503, `got ${anon.status}`);
    const guessing = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: SECRET } });
    check('no token configured → 503 even for a caller presenting a token', guessing.status === 503, `got ${guessing.status}`);
    check('gate state reports closed', assistantGateState({}).open === false);
  });

  // 2. CONFIGURED: only the exact secret gets through.
  await withEnv({ ZAYA_ASSISTANT_TOKEN: SECRET }, async () => {
    check('gate state reports open', assistantGateState(process.env).open === true);
    const anon = await call();
    check('configured, no header → 401', anon.status === 401, `got ${anon.status}`);
    const empty = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: '' } });
    check('configured, empty header → 401', empty.status === 401, `got ${empty.status}`);
    const wrong = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: 'not-the-secret-but-long-enough-xx' } });
    check('configured, wrong token → 401', wrong.status === 401, `got ${wrong.status}`);
    const prefix = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: SECRET.slice(0, -1) } });
    check('configured, token missing its last char → 401', prefix.status === 401, `got ${prefix.status}`);
    const extra = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: `${SECRET}x` } });
    check('configured, token with an extra char → 401', extra.status === 401, `got ${extra.status}`);
    const ok = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: SECRET } });
    check('configured, correct token → 200 and a real curated answer', ok.status === 200 && ok.source === 'kb', `got ${ok.status}/${ok.source}`);
    const cased = await call({ headers: { 'X-Zaya-Assistant-Token': SECRET } });
    check('header casing does not matter', cased.status === 200, `got ${cased.status}`);
    const getReq = await call({ method: 'GET', headers: { [ASSISTANT_TOKEN_HEADER]: SECRET } });
    check('the gate runs BEFORE the method check (authorised GET → 405)', getReq.status === 405, `got ${getReq.status}`);
    const getAnon = await call({ method: 'GET' });
    check('an unauthorised GET is refused, not answered', getAnon.status === 401, `got ${getAnon.status}`);
    const junk = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: SECRET }, body: 'not json' });
    check('an authorised caller sending junk still gets a normal 400', junk.status === 400, `got ${junk.status}`);
  });

  // 3. KILL SWITCH: closed even with the secret configured and presented.
  await withEnv({ ZAYA_ASSISTANT: 'off', ZAYA_ASSISTANT_TOKEN: SECRET }, async () => {
    const r = await call({ headers: { [ASSISTANT_TOKEN_HEADER]: SECRET } });
    check('ZAYA_ASSISTANT=off → 503 even with the correct token', r.status === 503, `got ${r.status}`);
  });

  // 4. PUBLISH INDEPENDENCE at runtime: the relay's answer is identical whatever
  //    the site's publish flag says, because it never reads it.
  const siteJson = JSON.parse(readFileSync(new URL('../src/content/data/site.json', import.meta.url), 'utf8'));
  await withEnv({ ZAYA_ASSISTANT_TOKEN: SECRET }, async () => {
    const before = await call();
    const savedPublished = siteJson.published;
    siteJson.published = !savedPublished; // in memory only — the relay cannot see it either way
    const after = await call();
    siteJson.published = savedPublished;
    check('I1: the relay answers the same regardless of the publish flag', before.status === after.status && before.status === 401);
  });

  check('tokenMatches rejects a non-string', tokenMatches(undefined, SECRET) === false && tokenMatches(SECRET, undefined) === false);
  check('tokenMatches accepts an exact match', tokenMatches(SECRET, SECRET) === true);
  check('presentedToken trims and is case-insensitive', presentedToken({ 'X-ZAYA-ASSISTANT-TOKEN': '  abc  ' }) === 'abc');
  check('presentedToken returns "" when absent', presentedToken({}) === '');
}

console.log(failures === 0 ? '\n✓ assistant gate: all checks passed' : `\n✘ assistant gate: ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
