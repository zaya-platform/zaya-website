// Pins the CMS OAuth relay hardening (P1c, 2026-08-23).
// Run: npm run test:oauth   (exits non-zero on any failure)
//
// Three publish-blocking defects were fixed; this is their executable half. It
// proves, without Netlify and without a deploy:
//   O1  the callback releases the token ONLY to an allowlisted origin, and the
//       allowlist still covers Netlify branch-deploy / deploy-preview hosts
//   O2  the CSRF state is CSPRNG, is carried in an HttpOnly cookie, and is
//       actually checked — a missing, wrong, or truncated state gets no token
//   O3  /admin loads an exactly pinned bundle with a real SRI hash
// House pattern: a plain node script like scripts/test-assistant-gate.mjs,
// wired into `npm test`.

import { readFileSync } from 'node:fs';
import {
  DEFAULT_SCOPE,
  HANDSHAKE,
  STATE_COOKIE,
  allowedOrigins,
  clearedStateCookie,
  matchOrigin,
  netlifySiteNames,
  normalizeOrigin,
  oauthScope,
  randomState,
  readCookie,
  requestOrigin,
  stateCookie,
  statesMatch,
} from '../netlify/oauth-shared.mjs';

let failures = 0;
const check = (name, cond, detail = '') => {
  if (cond) console.log(`  ✔ ${name}`);
  else {
    failures += 1;
    console.error(`  ✘ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const PROD = 'https://zayaethiopia.netlify.app';
const BRANCH = 'https://preview-assistant--zayaethiopia.netlify.app';
const eventOn = (host, extra = {}) => ({
  headers: { host, 'x-forwarded-proto': 'https', ...extra },
  queryStringParameters: {},
});
const allowFor = (event, env) => {
  const allowed = allowedOrigins(event, env);
  return [allowed, netlifySiteNames(allowed, env)];
};
const decide = (origin, event, env) => matchOrigin(origin, ...allowFor(event, env));

// ── O1: WHERE THE TOKEN MAY GO ───────────────────────────────────────────────
console.log('O1 origin allowlist — the token goes to us, and only to us:');
{
  const prodEnv = { URL: PROD, SITE_NAME: 'zayaethiopia' };

  check('the deploy serving the popup is allowed', decide(PROD, eventOn('zayaethiopia.netlify.app'), prodEnv));
  check(
    'a Netlify BRANCH deploy of the same site is allowed (previews keep working)',
    decide(BRANCH, eventOn('zayaethiopia.netlify.app'), prodEnv),
  );
  check(
    'a Netlify DEPLOY PREVIEW of the same site is allowed',
    decide('https://deploy-preview-12--zayaethiopia.netlify.app', eventOn('zayaethiopia.netlify.app'), prodEnv),
  );
  check(
    'the custom domain is allowed once URL points at it',
    decide('https://zayaethiopia.com', eventOn('zayaethiopia.com'), { URL: 'https://zayaethiopia.com' }),
  );
  check(
    'an extra origin named in CMS_ALLOWED_ORIGINS is allowed',
    decide('https://www.zayaethiopia.com', eventOn('zayaethiopia.com'), {
      URL: 'https://zayaethiopia.com',
      CMS_ALLOWED_ORIGINS: 'https://www.zayaethiopia.com, https://staging.example',
    }),
  );

  // …and the refusals. Each of these was reachable before the fix.
  const refuse = [
    ['a plain foreign site', 'https://evil.example'],
    ['a foreign site on netlify.app', 'https://evil.netlify.app'],
    ['a DIFFERENT netlify site', 'https://zaya-clone.netlify.app'],
    ['a branch alias of a DIFFERENT site', 'https://main--evil.netlify.app'],
    ['a suffix look-alike domain', 'https://zayaethiopia.netlify.app.evil.example'],
    ['a prefix look-alike domain', 'https://zayaethiopia.netlify.appevil.example'],
    ['the same host over plain http', 'http://zayaethiopia.netlify.app'],
    ['a null origin (sandboxed iframe / file://)', 'null'],
    ['an empty origin', ''],
    ['a non-string origin', undefined],
  ];
  for (const [label, origin] of refuse) {
    check(`refuses ${label}`, decide(origin, eventOn('zayaethiopia.netlify.app'), prodEnv) === false, String(origin));
  }

  check(
    'CMS_ALLOW_DEPLOY_PREVIEWS=false drops the branch-alias rule entirely',
    decide(BRANCH, eventOn('zayaethiopia.netlify.app'), { ...prodEnv, CMS_ALLOW_DEPLOY_PREVIEWS: 'false' }) === false,
  );
  check(
    'a forged x-forwarded-host cannot widen the allowlist',
    decide('https://evil.example', eventOn('zayaethiopia.netlify.app', { 'x-forwarded-host': 'evil.example' }), prodEnv) === false,
  );
  check(
    'with no Netlify env at all the allowlist is still just this deploy',
    JSON.stringify(allowedOrigins(eventOn('zayaethiopia.netlify.app'), {})) === JSON.stringify([PROD]),
  );
  check('requestOrigin ignores a missing host', requestOrigin({ headers: {} }) === '');
  check('normalizeOrigin rejects javascript: URLs', normalizeOrigin('javascript:alert(1)') === '');
}

// ── O2: THE CSRF STATE ───────────────────────────────────────────────────────
console.log('\nO2 CSRF state — minted strong, carried safely, actually checked:');
{
  const a = randomState();
  const b = randomState();
  check('state is 256 bits of CSPRNG, base64url', a.length === 43 && /^[A-Za-z0-9_-]+$/.test(a));
  check('two states never collide', a !== b);

  const cookie = stateCookie(a, { secure: true });
  check('cookie is HttpOnly', /;\s*HttpOnly(;|$)/.test(cookie));
  check('cookie is SameSite=Lax (survives GitHub\'s top-level redirect back)', /;\s*SameSite=Lax(;|$)/.test(cookie));
  check('cookie is Secure on https', /;\s*Secure(;|$)/.test(cookie));
  check('cookie expires (10 min)', /;\s*Max-Age=600(;|$)/.test(cookie));
  check('cookie is dropped on plain-http local dev', !/;\s*Secure(;|$)/.test(stateCookie(a, { secure: false })));
  check('the burn cookie expires immediately', /;\s*Max-Age=0(;|$)/.test(clearedStateCookie(true)));
  check('cookie round-trips', readCookie({ Cookie: `other=1; ${STATE_COOKIE}=${a}; z=2` }, STATE_COOKIE) === a);
  check('readCookie returns "" when absent', readCookie({ cookie: 'other=1' }, STATE_COOKIE) === '');

  check('statesMatch accepts an exact match', statesMatch(a, a) === true);
  check('statesMatch rejects a different state', statesMatch(a, b) === false);
  check('statesMatch rejects a truncated state', statesMatch(a.slice(0, -1), a) === false);
  check('statesMatch rejects undefined / empty', statesMatch(undefined, a) === false && statesMatch('', '') === false);
}

// ── O2b + O1b: THE CALLBACK ITSELF ───────────────────────────────────────────
console.log('\nO2b the callback endpoint refuses everything it should:');
{
  const TOKEN = 'gho_TEST_NOT_A_REAL_TOKEN';
  const savedFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  globalThis.fetch = async () => ({ json: async () => ({ access_token: TOKEN }) });
  process.env.GITHUB_CLIENT_ID = 'id';
  process.env.GITHUB_CLIENT_SECRET = 'secret';
  process.env.URL = PROD;
  process.env.SITE_NAME = 'zayaethiopia';
  delete process.env.CMS_ALLOWED_ORIGINS;
  delete process.env.CMS_ALLOW_DEPLOY_PREVIEWS;

  const { handler } = await import('../netlify/functions/callback.mjs');
  const call = (query, cookie) =>
    handler({
      headers: { host: 'zayaethiopia.netlify.app', 'x-forwarded-proto': 'https', ...(cookie ? { cookie } : {}) },
      queryStringParameters: query,
    });

  const good = randomState();
  const jar = `${STATE_COOKIE}=${good}`;

  const noState = await call({ code: 'abc' }, jar);
  check('no state in the URL → 400, no token', noState.statusCode === 400 && !noState.body.includes(TOKEN));

  const noCookie = await call({ code: 'abc', state: good }, '');
  check('no state cookie → 400, no token', noCookie.statusCode === 400 && !noCookie.body.includes(TOKEN));

  const wrong = await call({ code: 'abc', state: randomState() }, jar);
  check('mismatched state → 400, no token', wrong.statusCode === 400 && !wrong.body.includes(TOKEN));

  const noCode = await call({ state: good }, jar);
  check('no code → 400, no token', noCode.statusCode === 400 && !noCode.body.includes(TOKEN));

  const ok = await call({ code: 'abc', state: good }, jar);
  check('matching state → 200 and the token is released', ok.statusCode === 200 && ok.body.includes(TOKEN));
  check('the state cookie is burned on the way out', /Max-Age=0/.test(ok.headers['Set-Cookie']));
  check('the token page is never cached', /no-store/.test(ok.headers['Cache-Control']));
  check('the token page carries a nonce CSP', /script-src 'nonce-/.test(ok.headers['Content-Security-Policy']));

  // The whole point: the token is posted to a checked origin, never to "*".
  const wildcardPosts = ok.body.match(/postMessage\([^)]*'\*'\)/g) || [];
  check('exactly one "*" postMessage remains, and it is the non-secret handshake', wildcardPosts.length === 1);
  check('that "*" post carries only the handshake', wildcardPosts[0].includes('HANDSHAKE'));
  check('the token post is gated on the checked origin', ok.body.includes('e.source.postMessage(MESSAGE, e.origin)'));
  check('the shipped page contains the SAME origin rule this file tested', ok.body.includes(String(matchOrigin)));
  check('the shipped allowlist is this deploy', ok.body.includes(JSON.stringify(PROD).slice(1, -1)));
  check('the handshake string is unchanged (Decap/Sveltia compatibility)', HANDSHAKE === 'authorizing:github');

  globalThis.fetch = savedFetch;
  for (const key of ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'URL', 'SITE_NAME']) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
}

// ── O3: THE PINNED, HASHED ADMIN BUNDLE ──────────────────────────────────────
console.log('\nO3 /admin loads one exact, hash-checked bundle:');
{
  const admin = readFileSync(new URL('../public/admin/index.html', import.meta.url), 'utf8');
  const tag = admin.match(/<script[\s\S]*?><\/script>/);
  check('there is exactly one script tag', (admin.match(/<script/g) || []).length === 1 && !!tag);

  const src = (admin.match(/src="([^"]+)"/) || [])[1] || '';
  check('the CDN version is pinned exactly', /@sveltia\/cms@\d+\.\d+\.\d+\//.test(src), src);
  check('no floating tag is loaded', !/@sveltia\/cms\/dist/.test(admin) && !/@latest/.test(admin));

  const integrity = (admin.match(/integrity="([^"]+)"/) || [])[1] || '';
  check('there is an sha384 SRI hash of the right length', /^sha384-[A-Za-z0-9+/]{64}$/.test(integrity), integrity);
  check('the hash is not a placeholder', !/^sha384-(x+|0+|TODO)/i.test(integrity));
  check('crossorigin is set (without it the browser skips the check)', /crossorigin="anonymous"/.test(admin));
}

// ── O4: SCOPE ────────────────────────────────────────────────────────────────
console.log('\nO4 OAuth scope — narrowed, and overridable without a code change:');
{
  check('the default no longer asks for full private-repo access', !/(^|,)repo(,|$)/.test(DEFAULT_SCOPE), DEFAULT_SCOPE);
  check('the default is public_repo,user:email', oauthScope({}) === 'public_repo,user:email');
  check('GITHUB_OAUTH_SCOPE overrides it', oauthScope({ GITHUB_OAUTH_SCOPE: 'repo,user:email' }) === 'repo,user:email');
  check('an empty override falls back to the default', oauthScope({ GITHUB_OAUTH_SCOPE: '  ' }) === DEFAULT_SCOPE);
}

console.log(failures === 0 ? '\n✓ CMS OAuth relay: all checks passed' : `\n✘ CMS OAuth relay: ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
