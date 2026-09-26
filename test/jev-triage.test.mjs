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

// --- mocked-upstream branches (the real API is never called from tests) ---

const mockUpstream = async (status, body) => {
  process.env.JEV_API_KEY = 'test-only-key';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    { status, headers: { 'content-type': 'application/json' } },
  );
  try {
    return await handler({ httpMethod: 'POST', body: JSON.stringify({ message: 'How will I find shops near me and compare prices with ZAYA?' }) });
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.JEV_API_KEY;
  }
};

test('upstream 401 (authorisation failure) becomes a 502 with an honest use-email message', async () => {
  const response = await mockUpstream(401, { error: 'invalid key' });
  assert.equal(response.statusCode, 502);
  assert.match(JSON.parse(response.body).error, /use email instead/i);
});

test('upstream 402 (credit exhausted) becomes a 502 with an honest use-email message', async () => {
  const response = await mockUpstream(402, { error: 'insufficient credits' });
  assert.equal(response.statusCode, 502);
  assert.match(JSON.parse(response.body).error, /use email instead/i);
});

test('upstream timeout (abort) becomes a 502 with an honest use-email message', async () => {
  process.env.JEV_API_KEY = 'test-only-key';
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const error = new Error('The operation was aborted');
    error.name = 'AbortError';
    throw error;
  };
  try {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ message: 'How will I find shops near me and compare prices with ZAYA?' }) });
    assert.equal(response.statusCode, 502);
    assert.match(JSON.parse(response.body).error, /timed out/i);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.JEV_API_KEY;
  }
});

test('upstream 500 becomes a 502 with an honest use-email message', async () => {
  const response = await mockUpstream(500, { error: 'boom' });
  assert.equal(response.statusCode, 502);
  assert.match(JSON.parse(response.body).error, /temporarily unavailable|use email instead/i);
});

test('malformed JSON body returns a 400', async () => {
  process.env.JEV_API_KEY = 'test-only-key';
  try {
    const response = await handler({ httpMethod: 'POST', body: 'not json at all' });
    assert.equal(response.statusCode, 400);
    assert.match(JSON.parse(response.body).error, /valid message/i);
  } finally {
    delete process.env.JEV_API_KEY;
  }
});

test('too-short message returns a 400', async () => {
  process.env.JEV_API_KEY = 'test-only-key';
  try {
    const response = await handler({ httpMethod: 'POST', body: JSON.stringify({ message: 'hi' }) });
    assert.equal(response.statusCode, 400);
    assert.match(JSON.parse(response.body).error, /12 and 1,200/i);
  } finally {
    delete process.env.JEV_API_KEY;
  }
});

test('success returns only the documented routing shape', async () => {
  const response = await mockUpstream(200, {
    answers: {
      route: { type: 'choice', choice: 'merchant', confidence: 0.88 },
      urgency: { type: 'score', score: 1.2 },
      human_review: { type: 'noul', noul: 0.4 },
    },
  });
  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.deepEqual(Object.keys(body).sort(), ['humanReview', 'needsReview', 'route', 'routeConfidence', 'urgency']);
  assert.equal(body.route, 'merchant');
  assert.equal(body.needsReview, false);
});

test('low route confidence flags needsReview', async () => {
  const response = await mockUpstream(200, {
    answers: {
      route: { type: 'choice', choice: 'general', confidence: 0.5 },
      urgency: { type: 'score', score: 1 },
      human_review: { type: 'noul', noul: 0.2 },
    },
  });
  const body = JSON.parse(response.body);
  assert.equal(body.needsReview, true);
});
