// Vercel serverless function — keeps the Claude API key server-side.
// The browser POSTs { system, messages, max_tokens } here; the secret key
// (process.env.CLAUDE_API_KEY) never ships to the client bundle.

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5';

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
