// Vercel serverless function — keeps the Claude API key server-side.
// The browser POSTs { system, messages, max_tokens } here; the secret key
// (process.env.CLAUDE_API_KEY) never ships to the client bundle.

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;

// Confirm the caller holds a valid Firebase ID token for this project.
// Uses the Identity Toolkit REST API (no Admin SDK / service account needed).
async function verifyFirebaseToken(idToken) {
  if (!idToken || !FIREBASE_API_KEY) return false;
  try {
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    );
    if (!r.ok) return false;
    const data = await r.json();
    return Array.isArray(data.users) && data.users.length > 0;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'CLAUDE_API_KEY is not configured on the server.' });
    return;
  }

  // Require a signed-in Firebase user so the endpoint can't be abused for free
  // Claude usage. Demo (non-Firebase) sessions fall back to curated answers.
  const authz = req.headers.authorization || '';
  const idToken = authz.startsWith('Bearer ') ? authz.slice(7) : '';
  if (!(await verifyFirebaseToken(idToken))) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const { system, messages, max_tokens } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' });
      return;
    }

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: max_tokens || 1024,
        ...(system ? { system } : {}),
        messages
      })
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Upstream Claude request failed', detail: String(e) });
  }
}
