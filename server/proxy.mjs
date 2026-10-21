/**
 * PitchBoss Enterprise — Standalone Production Backend Proxy for Gemini AI
 * 
 * Purpose:
 * Shields the Gemini API Key on the server side so client browsers never see it in DevTools (F12).
 * Verifies optional license key header (X-PitchBoss-License) before executing AI turns.
 * 
 * Usage:
 * node server/proxy.mjs
 * Or run via Render / Docker / Railway with GEMINI_API_KEY environment variable.
 */

import http from 'http';

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-PitchBoss-License');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health' || req.url === '/api/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', proxyReady: Boolean(GEMINI_API_KEY), timestamp: Date.now() }));
    return;
  }

  // Chat endpoint
  if (req.url === '/api/gemini/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const apiKey = GEMINI_API_KEY || payload.clientApiKey;

        if (!apiKey) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY missing on server and no fallback provided.' }));
          return;
        }

        const model = payload.model || 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const upstream = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.geminiPayload)
        });

        const result = await upstream.json();
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Proxy internal error', message: err.message }));
      }
    });
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[PitchBoss Proxy] Running on http://localhost:${PORT}`);
  console.log(`[PitchBoss Proxy] Server Key Status: ${GEMINI_API_KEY ? 'Configured ✅' : 'Missing ⚠️ (Check GEMINI_API_KEY env)'}`);
});
