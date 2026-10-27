/**
 * PitchBoss Enterprise — Standalone Production Backend Proxy for Gemini AI & Team Management
 * 
 * Purpose:
 * - Multi-tenant workspace management
 * - Cloud scenarios sync & persistence
 * - Live team audit & employee session reports
 * - Secure admin authentication & token verification
 * - Neural Text-to-Speech proxy (Google Cloud TTS / Edge)
 * - Gemini AI proxy (shields API key in production)
 */

import http from 'http';
import { handleBackendRoute } from './backendLogic.mjs';

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-PitchBoss-Workspace, X-Admin-Token, X-PitchBoss-License');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Aggregate body
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      await handleBackendRoute(req, res, body);
    } catch (err) {
      console.error('[Server Error]', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[PitchBoss Backend Proxy] Running on http://localhost:${PORT}`);
  console.log(`[PitchBoss Backend Proxy] Gemini Key Status: ${GEMINI_API_KEY ? 'Configured ✅' : 'Missing ⚠️ (Check GEMINI_API_KEY env)'}`);
});
