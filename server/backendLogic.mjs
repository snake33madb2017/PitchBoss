/**
 * PitchBoss Enterprise — Centralized Backend Logic & Multi-Tenant Data Store
 * Handles:
 * - Multi-tenant workspaces (CompanyId / WorkspaceId)
 * - Cloud scenarios persistence & syncing across devices
 * - Team live audit & employee session reports
 * - Secure admin authentication & token verification
 * - Neural Text-to-Speech proxy (Google Cloud TTS / Edge)
 * - Gemini AI proxy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default In-Memory / File Database Schema
function getDefaultDb() {
  return {
    workspaces: [
      { id: 'default', name: 'General / Matriz', createdAt: Date.now() },
      { id: 'lovo-bar', name: 'LOVO Bar & Hospitality', createdAt: Date.now() },
      { id: 'tepic-madrid', name: 'Restaurante Tepic (Ayala 14)', createdAt: Date.now() }
    ],
    scenarios: {},
    reports: [],
    admin: {
      pin: process.env.ADMIN_PIN || '3319',
      sessions: []
    }
  };
}

let db = getDefaultDb();

// Load persisted DB if available
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    db = { ...getDefaultDb(), ...JSON.parse(raw) };
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
} catch (e) {
  console.warn('[PitchBoss DB] Warning loading db.json, using fallback in-memory:', e.message);
}

function persistDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('[PitchBoss DB] Error persisting db.json:', e.message);
  }
}

// Helper to send JSON responses
export function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-PitchBoss-Workspace, X-Admin-Token');
  res.end(JSON.stringify(data));
}

export async function handleBackendRoute(req, res, body = '') {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method;

  // 1. Health check
  if (pathname === '/api/health' || pathname === '/health') {
    return sendJson(res, 200, {
      status: 'ok',
      timestamp: Date.now(),
      workspacesCount: db.workspaces.length,
      reportsCount: db.reports.length,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)
    });
  }

  // 2. Admin Authentication
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const { pin } = JSON.parse(body || '{}');
      if (!db.admin.pin || db.admin.pin === '1234') {
        db.admin.pin = '3319';
        persistDb();
      }
      const expectedPin = process.env.ADMIN_PIN || db.admin.pin || '3319';
      if (pin && pin.trim() === expectedPin.trim()) {
        const token = 'pb_adm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
        db.admin.sessions.push({ token, createdAt: Date.now() });
        // Keep at most 20 active sessions
        if (db.admin.sessions.length > 20) {
          db.admin.sessions = db.admin.sessions.slice(-20);
        }
        persistDb();
        return sendJson(res, 200, { success: true, token, message: 'Autenticación exitosa' });
      }
      return sendJson(res, 401, { success: false, error: 'PIN incorrecto' });
    } catch (err) {
      return sendJson(res, 400, { success: false, error: 'Payload inválido' });
    }
  }

  if (pathname === '/api/admin/verify' && method === 'GET') {
    const token = req.headers['x-admin-token'] || urlObj.searchParams.get('token');
    const valid = db.admin.sessions.some(s => s.token === token);
    return sendJson(res, 200, { valid });
  }

  if (pathname === '/api/admin/change-pin' && method === 'POST') {
    const token = req.headers['x-admin-token'];
    const isAuthorized = db.admin.sessions.some(s => s.token === token);
    if (!isAuthorized) {
      return sendJson(res, 401, { error: 'No autorizado para cambiar el PIN' });
    }
    try {
      const { newPin } = JSON.parse(body || '{}');
      if (newPin && newPin.length >= 4) {
        db.admin.pin = newPin.trim();
        persistDb();
        return sendJson(res, 200, { success: true, message: 'PIN actualizado correctamente' });
      }
      return sendJson(res, 400, { error: 'El PIN debe tener al menos 4 caracteres' });
    } catch {
      return sendJson(res, 400, { error: 'Payload inválido' });
    }
  }

  // 3. Workspaces Management
  if (pathname === '/api/workspaces' && method === 'GET') {
    return sendJson(res, 200, { workspaces: db.workspaces });
  }

  if (pathname === '/api/workspaces' && method === 'POST') {
    try {
      const { name, id } = JSON.parse(body || '{}');
      if (!name) return sendJson(res, 400, { error: 'El nombre del espacio de trabajo es requerido' });
      const wsId = id || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const existing = db.workspaces.find(w => w.id === wsId);
      if (existing) {
        return sendJson(res, 200, { workspace: existing, message: 'Espacio de trabajo ya existente' });
      }
      const newWs = { id: wsId, name: name.trim(), createdAt: Date.now() };
      db.workspaces.push(newWs);
      persistDb();
      return sendJson(res, 201, { workspace: newWs });
    } catch {
      return sendJson(res, 400, { error: 'Payload inválido' });
    }
  }

  // 4. Scenarios Management (Multi-tenant)
  const workspaceId = req.headers['x-pitchboss-workspace'] || urlObj.searchParams.get('workspaceId') || 'default';

  if (pathname === '/api/scenarios' && method === 'GET') {
    const wsScenarios = db.scenarios[workspaceId] || [];
    return sendJson(res, 200, { workspaceId, scenarios: wsScenarios });
  }

  if (pathname === '/api/scenarios' && method === 'POST') {
    try {
      const scenario = JSON.parse(body || '{}');
      if (!scenario.id || !scenario.title) {
        return sendJson(res, 400, { error: 'ID y Título de escenario requeridos' });
      }
      if (!db.scenarios[workspaceId]) {
        db.scenarios[workspaceId] = [];
      }
      const list = db.scenarios[workspaceId];
      const index = list.findIndex(s => s.id === scenario.id);
      if (index >= 0) {
        list[index] = { ...scenario, updatedAt: Date.now() };
      } else {
        list.push({ ...scenario, createdAt: scenario.createdAt || Date.now(), updatedAt: Date.now() });
      }
      persistDb();
      return sendJson(res, 200, { success: true, scenario, workspaceId });
    } catch {
      return sendJson(res, 400, { error: 'Payload de escenario inválido' });
    }
  }

  if (pathname.startsWith('/api/scenarios/') && method === 'DELETE') {
    const scenarioId = pathname.replace('/api/scenarios/', '');
    if (db.scenarios[workspaceId]) {
      db.scenarios[workspaceId] = db.scenarios[workspaceId].filter(s => s.id !== scenarioId);
      persistDb();
    }
    return sendJson(res, 200, { success: true, deletedId: scenarioId, workspaceId });
  }

  // 5. Team Live Audit & Employee Session Reports
  if (pathname === '/api/reports' && method === 'GET') {
    let reports = db.reports;
    if (workspaceId && workspaceId !== 'all') {
      reports = reports.filter(r => r.workspaceId === workspaceId || !r.workspaceId);
    }
    return sendJson(res, 200, { reports: reports.slice(-100).reverse() });
  }

  if (pathname === '/api/reports' && method === 'POST') {
    try {
      const reportData = JSON.parse(body || '{}');
      const newReport = {
        id: 'rep_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        workspaceId,
        employeeName: reportData.employeeName || 'Colaborador',
        scenarioId: reportData.scenarioId,
        scenarioTitle: reportData.scenarioTitle,
        durationSeconds: reportData.durationSeconds || 0,
        totalMessages: reportData.totalMessages || 0,
        businessScore: reportData.businessScore || 0,
        englishScore: reportData.englishScore || 0,
        completedObjectives: reportData.completedObjectives || [],
        pendingObjectives: reportData.pendingObjectives || [],
        executiveSummary: reportData.executiveSummary || '',
        keyStrengths: reportData.keyStrengths || [],
        areasForImprovement: reportData.areasForImprovement || [],
        suggestedPhrases: reportData.suggestedPhrases || [],
        createdAt: Date.now()
      };
      db.reports.push(newReport);
      // Keep up to 500 reports
      if (db.reports.length > 500) {
        db.reports = db.reports.slice(-500);
      }
      persistDb();
      return sendJson(res, 201, { success: true, report: newReport });
    } catch {
      return sendJson(res, 400, { error: 'Payload de reporte inválido' });
    }
  }

  // 6. Neural TTS Proxy (Google Cloud TTS REST / Fallback)
  if (pathname === '/api/tts/speak' && method === 'POST') {
    try {
      const { text, voiceGender = 'female', lang = 'en-US' } = JSON.parse(body || '{}');
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

      if (apiKey && text) {
        // Attempt Google Cloud Text-to-Speech call
        const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
        const ttsResponse = await fetch(ttsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: text.slice(0, 500) },
            voice: {
              languageCode: lang,
              name: voiceGender === 'female' ? 'en-US-Journey-F' : 'en-US-Journey-D',
              ssmlGender: voiceGender.toUpperCase()
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 1.0,
              pitch: 0.0
            }
          })
        });

        if (ttsResponse.ok) {
          const ttsData = await ttsResponse.json();
          if (ttsData.audioContent) {
            return sendJson(res, 200, {
              success: true,
              audioBase64: ttsData.audioContent,
              format: 'audio/mp3',
              engine: 'google-neural-journey'
            });
          }
        }
      }

      // Return fallback signal so client uses Web Speech API
      return sendJson(res, 200, {
        success: false,
        fallbackToBrowser: true,
        message: 'Neural TTS fallback to browser WebSpeech API'
      });
    } catch (err) {
      return sendJson(res, 200, {
        success: false,
        fallbackToBrowser: true,
        error: err.message
      });
    }
  }

  // 7. Gemini AI Chat Proxy (existing)
  if (pathname === '/api/gemini/chat' && method === 'POST') {
    try {
      const parsed = JSON.parse(body || '{}');
      const serverApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || parsed.clientApiKey || '';
      const model = parsed.model || 'gemini-2.5-flash';

      if (!serverApiKey) {
        return sendJson(res, 400, { error: 'No GEMINI_API_KEY configured on server or in request.' });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${serverApiKey}`;
      const upstreamResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.geminiPayload)
      });

      const data = await upstreamResponse.json();
      return sendJson(res, upstreamResponse.status, data);
    } catch (err) {
      return sendJson(res, 500, { error: 'Proxy internal server error', details: err.message });
    }
  }

  return sendJson(res, 404, { error: 'API route not found', pathname });
}
