// Shared rules for the CMS GitHub OAuth relay (netlify/functions/auth.mjs + callback.mjs).
//
// WHY THIS FILE LIVES IN netlify/ AND NOT netlify/functions/:
// every top-level file in the functions directory is deployed as its own HTTP
// endpoint. This module is NOT an endpoint — it is library code that both
// functions import. (The assistant solves the same problem by nesting its
// helpers inside netlify/functions/assistant/; the relay is two separate
// endpoints, so it needs a sibling instead.)
//
// Everything here is a pure function with no I/O, so scripts/test-cms-oauth.mjs
// can prove the rules without a deploy — the same house pattern as
// netlify/functions/assistant/guard.mjs.
//
// What these rules defend:
// the token this relay hands back is a GitHub token with write access to the
// website repo. Whoever receives it can rewrite the site. So the relay must be
// certain (a) the browser finishing the flow is the browser that started it
// (state), and (b) the window it hands the token to is one of OUR OWN origins
// (origin allowlist).

import { randomBytes, timingSafeEqual } from 'node:crypto';

/** Cookie that carries the CSRF state between /auth and /callback. */
export const STATE_COOKIE = 'zaya_cms_oauth_state';

/** How long a started sign-in stays valid. Long enough to type a GitHub password. */
export const STATE_TTL_SECONDS = 600;

/** The Decap/Sveltia popup handshake string. Not a secret. */
export const HANDSHAKE = 'authorizing:github';

// The CMS needs to (1) read + write this repo and (2) know who the editor is so
// it can attribute commits. The repo zaya-platform/zaya-website is PUBLIC, so
// `public_repo` covers (1) — full `repo` would additionally hand every private
// repo the editor can reach to a token that lives in a browser tab. `user:email`
// covers (2) read-only, where plain `user` also grants profile WRITE.
// If the repo is ever made private, `public_repo` stops working: set
// GITHUB_OAUTH_SCOPE=repo,user:email in the Netlify environment — no code change.
export const DEFAULT_SCOPE = 'public_repo,user:email';

/** Header lookup that does not care about case. */
const header = (headers, name) => {
  if (!headers || typeof headers !== 'object') return '';
  const want = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === want) {
      const value = headers[key];
      return typeof value === 'string' ? value : '';
    }
  }
  return '';
};

/** `https://host` for anything URL-shaped, '' for anything else. */
export const normalizeOrigin = (value) => {
  if (typeof value !== 'string' || !value.trim()) return '';
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    return url.origin; // already lower-cased, default port dropped
  } catch {
    return '';
  }
};

/**
 * The origin THIS deploy is being served from.
 * Deliberately reads only `host` — the hostname the request actually arrived on,
 * set by Netlify's edge — and never `x-forwarded-host`, which a caller can forge.
 */
export const requestOrigin = (event) => {
  const headers = event && event.headers;
  const proto = (header(headers, 'x-forwarded-proto') || 'https').split(',')[0].trim();
  const host = header(headers, 'host').split(',')[0].trim();
  return host ? normalizeOrigin(`${proto}://${host}`) : '';
};

export const isHttps = (event) => requestOrigin(event).startsWith('https:');

/**
 * The concrete origins allowed to receive the token.
 *
 *   1. this deploy's own origin      — the normal case: /admin and the relay are the same site
 *   2. process.env.URL               — Netlify: the site's primary URL (the custom domain, once connected)
 *   3. process.env.DEPLOY_PRIME_URL  — Netlify: this deploy's branch / deploy-preview URL
 *   4. process.env.DEPLOY_URL        — Netlify: this deploy's unique permalink
 *   5. CMS_ALLOWED_ORIGINS           — comma-separated escape hatch (apex + www, a staging host, …)
 *
 * 2–4 are Netlify-provided and simply contribute nothing if absent, so the
 * allowlist degrades to "this deploy + whatever was configured explicitly"
 * rather than to "everything".
 */
export const allowedOrigins = (event, env = process.env) => {
  const out = [];
  const add = (value) => {
    const origin = normalizeOrigin(value);
    if (origin && !out.includes(origin)) out.push(origin);
  };
  add(requestOrigin(event));
  add(env.URL);
  add(env.DEPLOY_PRIME_URL);
  add(env.DEPLOY_URL);
  for (const part of String(env.CMS_ALLOWED_ORIGINS || '').split(',')) add(part);
  return out;
};

const NETLIFY_SITE = /^https:\/\/(?:[a-z0-9][a-z0-9-]*--)?([a-z0-9][a-z0-9-]*)\.netlify\.app$/;

/**
 * Netlify site names whose deploy aliases (`<branch>--<site>.netlify.app`) count
 * as us. Needed because config.yml pins `base_url` to ONE host, so a branch
 * deploy's /admin (a different host) opens the relay on the production host —
 * a strict same-origin check would break CMS login on every preview.
 * Set CMS_ALLOW_DEPLOY_PREVIEWS=false to drop the alias rule entirely.
 */
export const netlifySiteNames = (allowed, env = process.env) => {
  if (String(env.CMS_ALLOW_DEPLOY_PREVIEWS || '').trim().toLowerCase() === 'false') return [];
  const names = [];
  const push = (name) => {
    if (name && !names.includes(name)) names.push(name);
  };
  const configured = String(env.SITE_NAME || '').trim().toLowerCase();
  if (/^[a-z0-9][a-z0-9-]*$/.test(configured)) push(configured);
  for (const origin of allowed) {
    const match = NETLIFY_SITE.exec(origin);
    if (match) push(match[1]);
  }
  return names;
};

/**
 * THE ORIGIN RULE. Self-contained on purpose: its source is serialised with
 * String() into the callback popup, so the browser enforces byte-for-byte the
 * same rule the tests here exercise. Do not close over anything.
 */
export function matchOrigin(origin, allowed, siteNames) {
  if (typeof origin !== 'string' || !origin) return false;
  if (allowed.indexOf(origin) !== -1) return true;
  var alias = /^https:\/\/([a-z0-9][a-z0-9-]*)--([a-z0-9][a-z0-9-]*)\.netlify\.app$/.exec(origin);
  return !!alias && siteNames.indexOf(alias[2]) !== -1;
}

/** 256 bits from the OS CSPRNG. Math.random() is not a security primitive. */
export const randomState = () => randomBytes(32).toString('base64url');

/** Set-Cookie value holding the state between the two legs of the flow. */
export const stateCookie = (value, { secure = true, maxAge = STATE_TTL_SECONDS } = {}) =>
  [
    `${STATE_COOKIE}=${value}`,
    'Path=/',
    `Max-Age=${maxAge}`,
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : null,
  ]
    .filter(Boolean)
    .join('; ');

export const clearedStateCookie = (secure = true) => stateCookie('', { secure, maxAge: 0 });

export const readCookie = (headers, name) => {
  const raw = header(headers, 'cookie');
  if (!raw) return '';
  for (const pair of raw.split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    if (pair.slice(0, eq).trim() === name) return pair.slice(eq + 1).trim();
  }
  return '';
};

/** Constant-time comparison; false for anything that is not two equal-length strings. */
export const statesMatch = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
};

export const oauthScope = (env = process.env) => {
  const raw = String(env.GITHUB_OAUTH_SCOPE == null ? '' : env.GITHUB_OAUTH_SCOPE).trim();
  return raw || DEFAULT_SCOPE;
};

/** JSON safe to drop inside a <script> block. */
export const safeJson = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
