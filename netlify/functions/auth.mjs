// GitHub OAuth — step 1. Redirects the editor to GitHub to authorize. Runs on the
// same Netlify site as the CMS (no Cloudflare/Netlify-Identity needed). Config: set
// GITHUB_CLIENT_ID (+ SECRET for callback) in Netlify → Site settings → Environment.
export const handler = async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return { statusCode: 500, body: 'Set GITHUB_CLIENT_ID in Netlify env.' };
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${proto}://${event.headers.host}/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: Math.random().toString(36).slice(2),
    allow_signup: 'false',
  });
  return { statusCode: 302, headers: { Location: `https://github.com/login/oauth/authorize?${params}` }, body: '' };
};
