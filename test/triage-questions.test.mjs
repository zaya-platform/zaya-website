import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { removePersonalDetails } from '../netlify/functions/jev-triage.mjs';

const bank = JSON.parse(readFileSync(
  fileURLToPath(new URL('../src/data/triage-questions.json', import.meta.url)),
  'utf8',
));

const VALID_ROUTES = new Set(['customer_order', 'merchant', 'delivery', 'ride', 'diaspora', 'payment_account', 'general']);
const VALID_GROUPS = new Set(['Shopping', 'Shop owners', 'Delivery', 'Diaspora & RIDE', 'Account & safety', 'General']);
const EXPECTED_PER_ROUTE = { customer_order: 4, merchant: 4, delivery: 3, diaspora: 3, ride: 2, payment_account: 2, general: 4 };

test('question bank holds exactly the 22 advisor-approved questions', () => {
  assert.equal(bank.length, 22);
});

test('every entry has valid route, group, label shape and safe content', () => {
  for (const entry of bank) {
    assert.ok(VALID_ROUTES.has(entry.route), `valid route: ${entry.route}`);
    assert.ok(VALID_GROUPS.has(entry.group), `valid group: ${entry.group}`);
    assert.match(entry.label, /^\S+( \S+){1,3}$/, `label 2-4 words: ${entry.label}`);
    assert.ok(entry.question.length >= 12 && entry.question.length <= 1200, `question length: ${entry.question}`);
    // The same filter the server applies: a bank question must reach the reviewer unchanged.
    const visible = `${entry.question} ${entry.label}`;
    assert.equal(removePersonalDetails(visible), visible, 'no email, phone or card patterns');
  }
});

test('every route and group is represented with the expected counts', () => {
  const perRoute = {};
  for (const entry of bank) perRoute[entry.route] = (perRoute[entry.route] || 0) + 1;
  assert.deepEqual(perRoute, EXPECTED_PER_ROUTE);
  assert.deepEqual(
    new Set(bank.map(entry => entry.group)).size,
    VALID_GROUPS.size,
  );
});

test('questions are unique and labels are unique', () => {
  assert.equal(new Set(bank.map(entry => entry.question)).size, 22);
  assert.equal(new Set(bank.map(entry => entry.label)).size, 22);
});
