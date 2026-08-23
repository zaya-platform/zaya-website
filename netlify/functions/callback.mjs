// GitHub OAuth — step 2. Exchanges the code for a token and hands it back to the CMS
// via the standard postMessage handshake (works with Sveltia CMS and Decap CMS).
//
// SECURITY (2026-08-23). This endpoint hands out a GitHub token with write access to
// this repo, so it now proves two things before it does:
//
//   1. CSRF — the `state` GitHub echoed back must equal the one /auth minted and
//      parked in an HttpOnly cookie on this same host. No cookie, no match, no token.
//   2. ORIGIN — the popup used to postMessage the token to whatever origin had
//      messaged it (`e.origin`), with no check at all. Any page on the internet
//      could open this relay in a popup it owns, let GitHub's already-authorized
//      redirect run, message the popup, and be handed the token — silently. The
//      popup now hands the token only to an origin on an allowlist computed HERE,
//      from this deploy's own identity, and refuses otherwise.
//
// netlify/oauth-shared.mjs holds the rules; scripts/test-cms-oauth.mjs proves them.
import { randomBytes } from 'node:crypto';
import {
  HANDSHAKE,
  STATE_COOKIE,
  allowedOrigins,
  clearedStateCookie,
  isHttps,
  matchOrigin,
  netlifySiteNames,
  readCookie,
  safeJson,
  statesMatch,
} from '../oauth-shared.mjs';

const textResponse = (statusCode, body, cookie) => ({
  statusCode,
  headers: {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    // Always burn the state cookie: it is single-use either way.
    'Set-Cookie': cookie,
  },
  body,
});

export const handler = async (event) => {
  const query = event.queryStringParameters || {};
  const code = query.code;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const burn = clearedStateCookie(isHttps(event));

  if (!clientId || !clientSecret) return textResponse(500, 'Missing GitHub OAuth env vars.', burn);
  if (!code) return textResponse(400, 'Missing OAuth code.', burn);

  // ── 1. CSRF ───────────────────────────────────────────────────────────────
  const expected = readCookie(event.headers, STATE_COOKIE);
  if (!expected || !statesMatch(query.state, expected)) {
    return textResponse(
      400,
      'Sign-in could not be verified (OAuth state check failed). Start again from /admin.',
      burn,
    );
  }

  // ── 2. Where may this token go? Decided here, on the server. ──────────────
  const allowed = allowedOrigins(event, process.env);
  const siteNames = netlifySiteNames(allowed, process.env);
  if (allowed.length === 0) {
    return textResponse(500, 'Cannot determine this deploy origin; refusing to release a token.', burn);
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const data = await res.json();
  const ok = !!data.access_token;
  const payload = ok
    ? { token: data.access_token, provider: 'github' }
    : { error: data.error_description || 'OAuth failed' };
  const message = `authorization:github:${ok ? 'success' : 'error'}:${JSON.stringify(payload)}`;

  // The origin rule is shipped as the very source of the tested function, so the
  // browser cannot drift from what scripts/test-cms-oauth.mjs proves.
  const nonce = randomBytes(16).toString('base64');
  const html = `<!doctype html><meta charset="utf-8"><title>Signing you in…</title><body>Signing you in…<script nonce="${nonce}">
(function () {
  var ALLOWED = ${safeJson(allowed)};
  var SITE_NAMES = ${safeJson(siteNames)};
  var HANDSHAKE = ${safeJson(HANDSHAKE)};
  var MESSAGE = ${safeJson(message)};
  var matchOrigin = ${String(matchOrigin)};
  function receive(e) {
    // Only the window that opened us, only the agreed handshake string, and only
    // from an origin this deploy vouches for. Anything else is ignored WITHOUT
    // removing the listener, so a stray message cannot strand a real sign-in.
    if (!window.opener || e.source !== window.opener) return;
    if (e.data !== HANDSHAKE) return;
    if (!matchOrigin(e.origin, ALLOWED, SITE_NAMES)) {
      document.body.textContent =
        'Refused: this editor was opened from an unrecognised address (' + e.origin + ').';
      return;
    }
    window.removeEventListener('message', receive);
    e.source.postMessage(MESSAGE, e.origin);
  }
  window.addEventListener('message', receive);
  // The opener's origin is unknown until it answers, so this opening ping — which
  // carries no secret, just the literal string "authorizing:github" — goes to "*".
  // The token above never does.
  if (window.opener) window.opener.postMessage(HANDSHAKE, '*');
})();
</script></body>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // This page carries a live GitHub token in its body: never store it anywhere.
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      Pragma: 'no-cache',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      'Set-Cookie': burn,
    },
    body: html,
  };
};
