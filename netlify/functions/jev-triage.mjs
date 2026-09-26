const API_URL = process.env.JEV_API_URL || 'https://jevtypesafeai.com/api/v1/decide';

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  },
  body: JSON.stringify(body),
});

const removePersonalDetails = (value) => value
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email removed]')
  .replace(/(?:\+?251|0)?9\d{8}\b/g, '[phone removed]')
  .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[number removed]');

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  if (!process.env.JEV_API_KEY) {
    return json(503, { error: 'The ZAYA message reviewer is not available yet.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Please enter a valid message.' });
  }

  const rawMessage = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (rawMessage.length < 12 || rawMessage.length > 1200) {
    return json(400, { error: 'Please enter between 12 and 1,200 characters.' });
  }

  const state = removePersonalDetails(rawMessage);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${process.env.JEV_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.JEV_MODEL || 'jev-latest',
        state,
        questions: {
          route: {
            type: 'choice',
            instructions: 'Which ZAYA team should review this enquiry?',
            criteria: {
              customer_order: 'shopping, products, prices, order status, returns, or customer help',
              merchant: 'shop registration, stock, sales, customer credit, or merchant pilot',
              delivery: 'shop-managed delivery, a late delivery, address area, or deliverer issue',
              ride: 'the planned ZAYA RIDE experience or passenger transport enquiry',
              diaspora: 'sending essentials to family in Ethiopia or a future diaspora service',
              payment_account: 'payment, duplicate charge, login, account access, privacy, or security',
              general: 'launch information, partnership, media, employment, or anything else',
            },
          },
          urgency: {
            type: 'score',
            instructions: 'How quickly should the ZAYA team review this enquiry?',
            criteria: [
              'general information with no time pressure',
              'normal enquiry that can be reviewed within two business days',
              'time-sensitive problem that should be reviewed today',
              'possible safety, security, payment, or serious service problem needing prompt human attention',
            ],
          },
          human_review: {
            type: 'noul',
            instructions: 'Should a ZAYA team member personally review this enquiry promptly?',
            criteria: {
              true: 'the enquiry involves safety, security, payment, personal distress, or a time-sensitive service failure',
              false: 'the enquiry is routine information that does not need prompt personal review',
            },
          },
        },
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.answers) {
      return json(502, { error: 'The message reviewer could not complete this request. Please use email instead.' });
    }

    const route = data.answers.route || {};
    const urgency = data.answers.urgency || {};
    const humanReview = data.answers.human_review || {};

    return json(200, {
      route: route.choice || 'general',
      routeConfidence: Number(route.confidence || 0),
      urgency: Number(urgency.score || 0),
      humanReview: Number(humanReview.noul || 0),
      needsReview: Number(route.confidence || 0) < 0.72,
    });
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? 'The message reviewer timed out. Please use email instead.'
      : 'The message reviewer is temporarily unavailable. Please use email instead.';
    return json(502, { error: message });
  } finally {
    clearTimeout(timeout);
  }
}
