// ZAYA Website Assistant — the guardrails (CR-027 §6 / ADR-024 decision 3).
// Everything here runs BEFORE any model call and on every reply.

// ── PII scrub (W-D3): emails + phone shapes (E.164, Ethiopian 09/07 mobiles,
// spaced/dashed variants) are removed from the text BEFORE it can reach the
// provider. ZAYA attaches no identity and the widget collects none; this
// covers what a visitor types anyway. Residual personal text is covered by
// the Privacy-Policy disclosure + the widget microcopy.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RES = [
  /\+\s?\d{1,3}[\s.-]?\d{1,4}([\s.-]?\d{2,4}){1,4}/g, // +251 91 234 5678 and friends
  /\b0[79]\d{8}\b/g, // Ethiopian mobiles written locally: 09xxxxxxxx / 07xxxxxxxx
  /\b0[79]\d[\s.-]?\d{3}[\s.-]?\d{4}\b/g, // spaced local variants
  /\b\d{9,15}\b/g, // any long bare digit run — better scrubbed than sent
];

export function scrubPII(text) {
  let out = text.replace(EMAIL_RE, '[removed]');
  for (const re of PHONE_RES) out = out.replace(re, '[removed]');
  return out;
}

// ── Per-IP rate limit. HONEST LIMITATION: Netlify Functions are stateless —
// this Map lives per warm lambda instance, so the cap is per-instance, not
// global. For a founder-access preview on an unadvertised parked site that is
// a real brake on burst abuse; a shared store is a W-D4b (public launch)
// concern. Body-size caps + the model timeout bound the worst case.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map(); // ip -> [timestamps]

export function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  // bound the map — a scanner cycling IPs must not grow memory unbounded
  if (hits.size > 2000) {
    const cutoff = now - WINDOW_MS;
    for (const [k, v] of hits) {
      if (!v.some((t) => t > cutoff)) hits.delete(k);
    }
  }
  return false;
}

// ── Ethiopic detection (W-D5 output post-check): model output must be
// English-only; any Ethiopic in a MODEL reply degrades to the curated handoff.
const ETHIOPIC_RE = /[ሀ-፿]/;
export function hasEthiopic(text) {
  return ETHIOPIC_RE.test(text);
}

// ── Output post-check for the MODEL step (honesty enforcement in code, not
// just in the prompt): a reply that claims availability of a roadmap item, or
// invents a price the grounding does not carry, degrades to the handoff.
const ROADMAP_TERMS = ['delivery', 'diaspora basket', 'ride', 'school', 'voice', 'smart tool'];
const AVAILABILITY_CLAIMS = /\b(is|are|now)\s+(available|live|launched|ready to use)\b/i;

export function violatesHonesty(reply, groundingText) {
  if (reply.length > 1200) return true; // runaway generation
  if (hasEthiopic(reply)) return true; // W-D5: model text is English-only
  const lower = reply.toLowerCase();
  for (const term of ROADMAP_TERMS) {
    if (lower.includes(term) && AVAILABILITY_CLAIMS.test(reply)) return true;
  }
  // any ETB/birr amount in the reply must literally appear in the grounding
  const amounts = reply.match(/\b\d[\d,]*\s?(etb|birr)\b/gi) ?? [];
  for (const a of amounts) {
    const digits = a.replace(/[^\d]/g, '');
    if (!groundingText.includes(digits)) return true;
  }
  return false;
}
