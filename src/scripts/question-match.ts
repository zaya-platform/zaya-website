// Instant-answer matching for the Jev enquiry: decides whether a typed message is
// clearly the same as a published bank question. Conservative by design — when unsure,
// return no match so the normal review flow runs instead.

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did', 'can',
  'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'us',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'what', 'when', 'where', 'which', 'who', 'whom', 'how', 'why',
  'if', 'then', 'than', 'that', 'this', 'these', 'those', 'there', 'here',
  'not', 'no', 'yes', 'so', 'as', 'about', 'into', 'up', 'down', 'out', 'over', 'under',
  'before', 'after', 'again', 'per', 'also', 'get', 'got',
]);

export type MatchableQuestion = { question: string; route: string };

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function significantTokens(text: string): string[] {
  return normalizeText(text).split(' ').filter(token => token.length > 1 && !STOP_WORDS.has(token));
}

/** Share of the bank question's significant tokens that also appear in the typed text (0..1). */
export function similarityToBankQuestion(typed: string, bankQuestion: string): number {
  const typedTokens = new Set(significantTokens(typed));
  const bankTokens = significantTokens(bankQuestion);
  if (bankTokens.length === 0) return 0;
  let shared = 0;
  for (const token of bankTokens) if (typedTokens.has(token)) shared += 1;
  return shared / bankTokens.length;
}

/** Share of the typed text's significant tokens that the bank question also contains (0..1). */
export function typedCoveredByBankQuestion(typed: string, bankQuestion: string): number {
  const typedTokens = [...new Set(significantTokens(typed))];
  const bankTokens = new Set(significantTokens(bankQuestion));
  if (typedTokens.length === 0) return 0;
  let covered = 0;
  for (const token of typedTokens) if (bankTokens.has(token)) covered += 1;
  return covered / typedTokens.length;
}

/**
 * Returns the matching bank entry when the typed text is the same question
 * (exact after normalisation, or token overlap >= 0.8 of the bank question).
 * The typed text must also be mostly that question (>= 0.6 of its own tokens):
 * a longer message that merely contains a bank question carries a different
 * request and goes to the review flow. Anything less certain returns null.
 */
export function matchBankQuestion<T extends MatchableQuestion>(
  typed: string,
  bank: readonly T[],
  threshold = 0.8,
  minTypedCoverage = 0.6,
): T | null {
  const normalizedTyped = normalizeText(typed);
  if (normalizedTyped.length === 0) return null;
  for (const entry of bank) {
    if (normalizeText(entry.question) === normalizedTyped) return entry;
  }
  let best: T | null = null;
  let bestScore = 0;
  for (const entry of bank) {
    const score = similarityToBankQuestion(typed, entry.question);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (!best || bestScore < threshold) return null;
  return typedCoveredByBankQuestion(typed, best.question) >= minTypedCoverage ? best : null;
}
