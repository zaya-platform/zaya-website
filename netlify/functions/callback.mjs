// GitHub OAuth — step 2. Exchanges the code for a token and hands it back to the CMS
// via the standard postMessage handshake (works with Sveltia CMS and Decap CMS).
export const handler = async (event) => {
  const code = event.queryStringParameters && event.queryStringParameters.code;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!code || !clientId || !clientSecret) return { statusCode: 400, body: 'Missing code or GitHub OAuth env vars.' };
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const data = await res.json();
  const ok = !!data.access_token;
  const payload = ok ? { token: data.access_token, provider: 'github' } : { error: data.error_description || 'OAuth failed' };
  const message = `authorization:github:${ok ? 'success' : 'error'}:${JSON.stringify(payload)}`;
  const html = `<!doctype html><meta charset="utf-8"><body>Signing you in…<script>
    (function(){
      function receive(e){ if(window.opener){ window.opener.postMessage(${JSON.stringify(message)}, e.origin); } window.removeEventListener('message', receive); }
      window.addEventListener('message', receive);
      if(window.opener){ window.opener.postMessage('authorizing:github', '*'); }
    })();
  </script></body>`;
  return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: html };
};
