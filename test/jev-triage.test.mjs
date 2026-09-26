import test from 'node:test';
import assert from 'node:assert/strict';
import { handler } from '../netlify/functions/jev-triage.mjs';

test('returns a safe unavailable response when no server key is configured', async () => {
  delete process.env.JEV_API_KEY;
  const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ message: 'Where is my order today?' }) });
  assert.equal(response.statusCode, 503);
  assert.equal(JSON.parse(response.body).error, 'The ZAYA message reviewer is not available yet.');
});

test('redacts common personal details and returns only routing metadata', async () => {
  process.env.JEV_API_KEY = 'test-only-key';
  const originalFetch = globalThis.fetch;
  let transmittedState = '';

  globalThis.fetch = async (_url, options) => {
    transmittedState = JSON.parse(options.body).state;
    return new Response(JSON.stringify({
      answers: {
        route: { type: 'choice', choice: 'delivery', confidence: 0.91 },
        urgency: { type: 'score', score: 2.4 },
        human_review: { type: 'noul', noul: 0.82 },
      },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ message: 'Call +251912835922 or me@example.com about order 4111 1111 1111 1111.' }),
    });
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.equal(body.route, 'delivery');
    assert.equal(body.humanReview, 0.82);
    assert.match(transmittedState, /\[phone removed\]/);
    assert.match(transmittedState, /\[email removed\]/);
    assert.match(transmittedState, /\[number removed\]/);
    assert.doesNotMatch(transmittedState, /me@example\.com|912835922|4111/);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.JEV_API_KEY;
  }
});
