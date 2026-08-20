// ZAYA Website Assistant — THE SEPARATING GATE (founder ruling 2026-08-20).
//
// WHY THIS FILE EXISTS
// Until now ONE flag (site.json `published`) drove the whole site, and the
// assistant was mounted BARE in Base.astro — so it shipped on every build
// regardless of any decision about it, and /api/assistant answered anyone on
// the internet. Publish and "is the AI assistant exposed" are two different
// risks with two different owners, so they now have TWO INDEPENDENT SWITCHES:
//
//   publish   → src/content/data/site.json  "published"     (F4, indexing)
//   assistant → src/config/assistant.json   "enabled"       (W-D4a/W-D4b)
//
// Neither reads the other. Flipping publish changes NOTHING about assistant
// exposure, in either direction, and vice versa.
//
// THIS MODULE IS PURE (no imports, no I/O) so the exact same resolution runs
// in the Astro build, in scripts/check-publish.mjs and in the tests. Callers
// read the file; this module decides.
//
// FAIL-CLOSED IS THE WHOLE POINT: every unknown, missing, malformed, mistyped
// or ambiguous input resolves to enabled:false. There is no input that turns
// the assistant on by accident — turning it ON needs (a) a deliberate `true`
// or an exact env `on`, AND (b) a usable shared secret.

// A usable token is long enough to not be guessable and shaped so it can ride
// in an HTTP header without quoting surprises. 24 chars of [A-Za-z0-9_-] is
// ~143 bits at base64url — far past brute force over a rate-limited endpoint.
// CANONICAL DEFINITION. netlify/functions/assistant/guard.mjs deliberately
// restates this rule server-side (it must not depend on bundling a file from
// src/); scripts/test-assistant-gate.mjs asserts the two never drift.
export const MIN_TOKEN_CHARS = 24;
export const TOKEN_RE = /^[A-Za-z0-9_-]+$/;

/** True only for a string that is a usable shared secret. Everything else — undefined,
 *  null, numbers, short strings, strings with spaces/quotes/newlines — is false. */
export function isUsableToken(value) {
  if (typeof value !== 'string') return false;
  if (value.length < MIN_TOKEN_CHARS) return false;
  return TOKEN_RE.test(value);
}

/** Parse the committed config text. NEVER throws: a missing or malformed file
 *  yields ok:false, which resolveAssistant() turns into enabled:false. */
export function parseAssistantConfig(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return { ok: false, config: null, reason: 'src/config/assistant.json is missing or empty' };
  }
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    return { ok: false, config: null, reason: `src/config/assistant.json is not valid JSON (${error.message})` };
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, config: null, reason: 'src/config/assistant.json is not a JSON object' };
  }
  return { ok: true, config: value, reason: 'config parsed' };
}

/** Read the env switch. Returns 'on' | 'off' | null (absent) | 'malformed'. */
function readEnvSwitch(env) {
  const raw = env?.ZAYA_ASSISTANT;
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const v = String(raw).trim().toLowerCase();
  if (v === 'on') return 'on';
  if (v === 'off') return 'off';
  return 'malformed'; // "true", "1", "yes", typos → fail closed
}

/**
 * Resolve the assistant's build-time state.
 *
 *   resolveAssistant({ config, env }) → { enabled, token, reason, detail }
 *
 * PRECEDENCE (and why):
 *   1. ZAYA_ASSISTANT=off   → OFF, always. A kill switch must beat everything,
 *                             including a committed `enabled:true`.
 *   2. ZAYA_ASSISTANT=on    → ON (subject to the token). This is how the
 *                             founder's W-D4a preview is armed on ONE Netlify
 *                             deploy context WITHOUT a commit and WITHOUT
 *                             touching production. It intentionally beats a
 *                             committed `false` — the committed W-D4b gate is
 *                             re-asserted for publish builds by
 *                             scripts/check-publish.mjs, which fails a publish
 *                             build whenever the assistant resolves ON without
 *                             `publicLaunchApproved: true`.
 *   3. anything else in ZAYA_ASSISTANT → OFF (malformed → closed).
 *   4. no env switch        → the committed config's `enabled`, and ONLY the
 *                             strict boolean true counts.
 *   5. No usable token      → OFF regardless of everything above. A widget
 *                             without the shared secret could only ever collect
 *                             401s, so shipping its markup would be pure
 *                             exposure with zero function.
 */
export function resolveAssistant({ config = null, env = {} } = {}) {
  const envSwitch = readEnvSwitch(env);
  const configEnabled = config && typeof config === 'object' && config.enabled === true;
  const token = env?.ZAYA_ASSISTANT_TOKEN;
  const tokenOk = isUsableToken(token);

  const detail = {
    configEnabled: Boolean(configEnabled),
    envSwitch,
    tokenOk,
    publicLaunchApproved: Boolean(config && typeof config === 'object' && config.publicLaunchApproved === true),
  };
  const off = (reason) => ({ enabled: false, token: null, reason, detail });

  if (envSwitch === 'off') return off('ZAYA_ASSISTANT=off — kill switch set');
  if (envSwitch === 'malformed') {
    return off(`ZAYA_ASSISTANT is set to something other than "on"/"off" — refusing to guess`);
  }
  const wanted = envSwitch === 'on' || configEnabled;
  if (!wanted) {
    return off(
      'assistant.json enabled is not true and ZAYA_ASSISTANT is not "on" — assistant off ' +
        "(this is the SHIPPED DEFAULT: W-D4b is the founder's gate)",
    );
  }
  if (!tokenOk) {
    return off(
      `assistant requested ON but ZAYA_ASSISTANT_TOKEN is missing or unusable ` +
        `(need ≥ ${MIN_TOKEN_CHARS} chars of A-Z a-z 0-9 _ -) — refusing to ship a widget that can only get 401s`,
    );
  }
  return {
    enabled: true,
    token: String(token),
    reason: envSwitch === 'on' ? 'ZAYA_ASSISTANT=on with a usable token' : 'assistant.json enabled:true with a usable token',
    detail,
  };
}
