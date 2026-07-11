// ZAYA Website Assistant — the guardrails (CR-027 §6 / ADR-024 decision 3).
// Everything here runs BEFORE any model call and on every reply.
// Hardened after the M-preview adversarial review (2026-07-12).

// ── PII scrub (W-D3): emails + ANY phone-shaped digit run are removed BEFORE
// the text can reach the provider. The earlier version only caught NANP-style
// 3-3-4 spacing; Ethiopian mobiles carry a 4-digit prefix (09XX) and are
// written 0912 345 678, (0912) 34 56 78, +251-91-234-5678, etc. So instead of
// enumerating groupings we find every candidate run of digits+separators and
// scrub any that carries 7–15 digits (a phone number's worth). ZAYA attaches
// no identity and the widget collects none; this covers what a visitor types.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// A candidate: a digit, then 5+ digit/separator chars, then a digit.
const PHONE_CANDIDATE_RE = /\+?\d[\d\s().‐-―-]{5,}\d/g;

export function scrubPII(text) {
  let out = text.replace(EMAIL_RE, '[removed]');
  out = out.replace(PHONE_CANDIDATE_RE, (m) => {
    const digits = (m.match(/\d/g) || []).length;
    return digits >= 7 && digits <= 15 ? '[removed]' : m;
  });
  return out;
}

// ── Per-IP rate limit + a global per-instance daily budget. HONEST LIMITATION:
// Netlify Functions are stateless — both counters live per warm lambda
// instance, so neither is truly global. For a founder-access preview on an
// unadvertised parked site that is a real brake; a SHARED store (Upstash/etc.)
// is a W-D4b (public launch) item, noted in the design §5. Body caps + the
// model timeout bound the worst case.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const GLOBAL_DAILY_CAP = 1500; // per warm instance — a cost backstop, not a promise
const GLOBAL_WINDOW_MS = 24 * 60 * 60 * 1000;
const hits = new Map(); // ip -> [timestamps]
let globalCount = 0;
let globalWindowStart = 0; // set from the first request's clock (no Date.now at import)

export function rateLimited(ip, now = Date.now()) {
  // global daily budget (per instance)
  if (globalWindowStart === 0 || now - globalWindowStart > GLOBAL_WINDOW_MS) {
    globalWindowStart = now;
    globalCount = 0;
  }
  if (globalCount >= GLOBAL_DAILY_CAP) return true;

  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  globalCount += 1;
  if (hits.size > 2000) {
    const cutoff = now - WINDOW_MS;
    for (const [k, v] of hits) {
      if (!v.some((t) => t > cutoff)) hits.delete(k);
    }
  }
  return false;
}

// ── Script + language detection ─────────────────────────────────────────────
// Ethiopic: main block + Supplement + Extended + Extended-A (U+1200–137F,
// 1380–139F, 2D80–2DDF, AB00–AB2F) — the earlier regex covered only the main
// block, letting Supplement/Extended text through the gate.
const ETHIOPIC_RE = /[ሀ-፿ᎀ-᎟ⶀ-⷟꬀-꬯]/;
export function hasEthiopic(text) {
  return ETHIOPIC_RE.test(text);
}

// Afaan Oromoo is LATIN-script, so "no Ethiopic" is NOT "English". These are
// high-frequency Oromo function/vocab words used as whole-word markers to keep
// romanized Oromo OUT of the English-only model path (W-D5), on both the input
// and the output side. Not a language classifier — a conservative gate that
// errs toward the curated handoff.
const OROMO_MARKERS = [
  'fi', 'kan', 'hin', 'jira', 'jiru', 'keessa', 'akka', 'isin', 'keenya', 'keessan',
  'dhufa', 'danda', 'gurgurtaa', 'suuqii', 'suuqota', 'maamila', 'maamiltoota',
  'tajaajila', 'gaafadhaa', 'gargaaraa', 'eeyyee', 'miti', 'gatii', 'kaffaltii',
  'daldala', 'daldaltoota', 'meeshaalee', 'waltajjii', 'naannoo', 'itoophiyaa',
  'maali', 'akkam', 'qunnamaa', 'qabu', 'qabaa', 'barbaadu',
];
const OROMO_RE = new RegExp(`\\b(${OROMO_MARKERS.join('|')})\\b`, 'i');
export function looksOromo(text) {
  return OROMO_RE.test(text);
}

// A positive English check for MODEL OUTPUT (W-D5): the reply must be
// predominantly ASCII-Latin, carry common English function words, and NOT trip
// the Oromo/Ethiopic markers. Anything else degrades to the handoff — so novel
// model text in Afaan Oromoo, Amharic, Tigrinya or a romanization can never
// reach a visitor.
const ENGLISH_STOPWORDS = ['the', 'is', 'are', 'you', 'we', 'for', 'and', 'to', 'a', 'of', 'in', 'on', 'with', 'can', 'your', 'our', 'it', 'that', 'this'];
export function isEnglishReply(text) {
  if (hasEthiopic(text)) return false;
  if (looksOromo(text)) return false;
  const ascii = (text.match(/[\x00-\x7F]/g) || []).length / Math.max(text.length, 1);
  if (ascii < 0.9) return false; // Tigrinya/Amharic/other non-Latin
  const lower = ` ${text.toLowerCase()} `;
  const hits = ENGLISH_STOPWORDS.filter((w) => lower.includes(` ${w} `)).length;
  return hits >= 2;
}

// ── Output post-check for the MODEL step (honesty enforcement in CODE, not
// just in the prompt). A reply that claims availability of a roadmap item, or
// carries a number the grounding does not, or is not clean English, degrades
// to the handoff.
const ROADMAP_TERMS = [
  'delivery', 'deliver', 'diaspora', 'basket', 'ride', 'taxi', 'school', 'cctv',
  'checkout', 'voice', 'smart tool', 'recommendation', 'transport', 'money transfer', 'remittance',
];
// "is/are/now/currently/already available|live|launched|ready|active|out",
// "has/have launched", "you can (use|order|get) ... (today|now)".
const AVAILABILITY_CLAIMS =
  /\b(is|are|now|currently|already)\s+(available|live|launched|ready|active|out\b)|\bhas\s+(launched|shipped|gone live)|\byou can (use|order|get|buy|access)\b.*\b(today|now|already)\b/i;

export function violatesHonesty(reply, groundingText) {
  if (reply.length > 1200) return true; // runaway generation
  if (!isEnglishReply(reply)) return true; // W-D5: model text is English-only
  const lower = reply.toLowerCase();
  for (const term of ROADMAP_TERMS) {
    if (lower.includes(term) && AVAILABILITY_CLAIMS.test(reply)) return true;
  }
  // Any number that reads like a price/plan figure must appear in the
  // grounding verbatim. Catches "1500 ETB", "999 birr", bare "1500 per month",
  // "$50/mo" — not just amounts glued to ETB/birr.
  const priceLike = reply.match(/\b\d[\d,]*(?:\.\d+)?\s*(?:etb|birr|usd|\$)?\s*(?:\/|per\s+)?\s*(?:mo|month|year|branch|plan)?\b/gi) ?? [];
  for (const a of priceLike) {
    const digits = a.replace(/[^\d]/g, '');
    if (digits.length >= 2 && !groundingText.replace(/[^\d]/g, ' ').split(/\s+/).includes(digits)) {
      // a multi-digit figure not present in the grounding → refuse
      if (/(etb|birr|usd|\$|\/|per|mo|month|year|plan|branch)/i.test(a)) return true;
    }
  }
  return false;
}
