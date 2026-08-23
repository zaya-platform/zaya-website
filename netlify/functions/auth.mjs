// GitHub OAuth — step 1. Redirects the editor to GitHub to authorize. Runs on the
// same Netlify site as the CMS (no Cloudflare/Netlify-Identity needed). Config: set
// GITHUB_CLIENT_ID (+ SECRET for callback) in Netlify → Site settings → Environment.
//
// SECURITY (2026-08-23): this leg mints the CSRF `state` and parks a copy in an
// HttpOnly cookie so /callback can prove the browser coming back is the browser
// that left. See netlify/oauth-shared.mjs for the rules and why they are shaped
// this way; scripts/test-cms-oauth.mjs proves them.
import {
  STATE_TTL_SECONDS,
  oauthScope,
  randomState,
  requestOrigin,
  stateCookie,
} from '../oauth-shared.mjs';

export const handler = async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) return { statusCode: 500, body: 'Set GITHUB_CLIENT_ID in Netlify env.' };

  const origin = requestOrigin(event);
  if (!origin) return { statusCode: 400, body: 'Cannot determine this deploy origin.' };

  // 256 bits of CSPRNG. The URL copy travels via GitHub; the cookie copy travels
  // via the browser. /callback refuses unless the two match.
  const state = randomState();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/callback`,
    scope: oauthScope(process.env),
    state,
    allow_signup: 'false',
  });

  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params}`,
      // Path=/ so /callback (a sibling path on this same host) receives it.
      // HttpOnly: page scripts, including any injected one, cannot read it.
      // SameSite=Lax: still sent on GitHub's top-level GET redirect back to us,
      // but never attached to a cross-site subresource or POST.
      // Secure: only on https (omitted on plain-http local dev so `netlify dev` works).
      'Set-Cookie': stateCookie(state, {
        secure: origin.startsWith('https:'),
        maxAge: STATE_TTL_SECONDS,
      }),
      'Cache-Control': 'no-store',
    },
    body: '',
  };
};
