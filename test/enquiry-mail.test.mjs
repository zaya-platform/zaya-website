import test from 'node:test';
import assert from 'node:assert/strict';
import { ENQUIRY_ADDRESS, instantAnswerMailto, reviewedEnquiryMailto } from '../src/scripts/enquiry-mail.ts';

// Decode a mailto: link the way an email app does: one round of percent-decoding per field.
const openInMailApp = (href) => {
  const url = new URL(href);
  const fields = {};
  for (const pair of url.search.slice(1).split('&')) {
    const [key, value] = pair.split('=');
    fields[key] = decodeURIComponent(value);
  }
  return { to: url.pathname, subject: fields.subject, body: fields.body };
};

test('reviewed enquiry: the mail app shows a readable subject (encoded exactly once)', () => {
  const mail = openInMailApp(reviewedEnquiryMailto('customer_order', 'Shopping and orders', 'Where can I buy teff near Bole?', false));
  assert.equal(mail.to, ENQUIRY_ADDRESS);
  assert.equal(mail.subject, 'ZAYA customer_order enquiry');
  assert.equal(mail.body, 'Where can I buy teff near Bole?\n\nSuggested website route: Shopping and orders');
});

test('fallback enquiry: the mail app shows a readable subject and the visitor’s message', () => {
  const mail = openInMailApp(reviewedEnquiryMailto('general', 'General ZAYA enquiry', 'My shop in Bole needs help & advice.', true));
  assert.equal(mail.subject, 'ZAYA general enquiry');
  assert.equal(mail.body, 'My shop in Bole needs help & advice.\n\nSent via the website enquiry fallback.');
});

test('instant answer: the email draft keeps the visitor’s own words, not only the bank question', () => {
  const entry = { route: 'customer_order', question: 'Can I order from a neighbourhood shop and pay when I receive it?' };
  const typed = 'Can I order from a neighbourhood shop and pay when I receive it? Please reply in Amharic.';
  const mail = openInMailApp(instantAnswerMailto(entry, typed));
  assert.equal(mail.subject, 'ZAYA customer_order enquiry');
  assert.ok(mail.body.includes(typed), `body should contain the typed message, got: ${JSON.stringify(mail.body)}`);
});

test('instant answer from a chip (message identical to the bank question) is not duplicated', () => {
  const entry = { route: 'general', question: 'Can I receive launch updates by email?' };
  const mail = openInMailApp(instantAnswerMailto(entry, '  Can I receive launch updates by email?  '));
  assert.equal(mail.body, 'Can I receive launch updates by email?\n\nAnswered from ZAYA\'s published information.');
});
