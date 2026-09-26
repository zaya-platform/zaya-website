import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { matchBankQuestion, normalizeText, similarityToBankQuestion } from '../src/scripts/question-match.ts';

const bank = JSON.parse(readFileSync(
  fileURLToPath(new URL('../src/data/triage-questions.json', import.meta.url)),
  'utf8',
));

test('exact bank question matches instantly (same entry)', () => {
  const typed = '  How will I find shops near me and compare prices with ZAYA?  ';
  const match = matchBankQuestion(typed, bank);
  assert.ok(match);
  assert.equal(match.route, 'customer_order');
  assert.equal(match.question, bank[0].question);
});

test('punctuation/case differences still count as an exact match', () => {
  const typed = 'can i order from a neighbourhood shop and pay when i receive it';
  const match = matchBankQuestion(typed, bank);
  assert.ok(match);
  assert.equal(match.route, 'customer_order');
});

test('paraphrase with token overlap >= 0.8 matches the bank answer', () => {
  const typed = 'How can I find nearby shops and compare prices with ZAYA?';
  const score = similarityToBankQuestion(typed, bank[0].question);
  assert.ok(score >= 0.8, `expected >= 0.8, got ${score}`);
  const match = matchBankQuestion(typed, bank);
  assert.ok(match);
  assert.equal(match.route, 'customer_order');
});

test('similar-but-different questions never match a bank answer', () => {
  const typed = 'Can I order groceries online for home delivery?';
  assert.equal(matchBankQuestion(typed, bank), null);
  const typed2 = 'Does ZAYA work on iPhones in Bahir Dar?';
  assert.equal(matchBankQuestion(typed2, bank), null);
  const typed3 = 'What happens when a delivery is late?';
  assert.equal(matchBankQuestion(typed3, bank), null);
});

test('empty and too-short messages never match', () => {
  assert.equal(matchBankQuestion('', bank), null);
  assert.equal(matchBankQuestion('   ???   ', bank), null);
  assert.equal(matchBankQuestion('Hi', bank), null);
});

test('every bank answer carries a valid route and non-empty text', () => {
  const validRoutes = new Set(['customer_order', 'merchant', 'delivery', 'ride', 'diaspora', 'payment_account', 'general']);
  assert.equal(bank.length, 22);
  for (const entry of bank) {
    assert.ok(validRoutes.has(entry.route), `route: ${entry.route}`);
    assert.ok(entry.answer && entry.answer.length >= 12, `answer for: ${entry.question}`);
    const shown = matchBankQuestion(entry.question, bank);
    assert.ok(shown);
    assert.equal(shown.route, entry.route);
    assert.equal(shown.answer, entry.answer);
  }
});

test('normalisation strips punctuation and collapses whitespace', () => {
  assert.equal(normalizeText('  Hello,   WORLD!!! ---'), 'hello world');
});
