import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Dev server backend proxy plugin for Gemini API.
 * Keeps API keys shielded on the server side and tests backend proxy flow locally.
 */
function geminiBackendProxyPlugin(): Plugin {
  return {
    name: 'gemini-backend-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gemini/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            const serverApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || parsed.clientApiKey || '';
            const model = parsed.model || 'gemini-2.5-flash';

            if (!serverApiKey) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No GEMINI_API_KEY configured on proxy server or provided in request.' }));
              return;
            }

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${serverApiKey}`;
            const upstreamResponse = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(parsed.geminiPayload)
            });

            const data = await upstreamResponse.json();
            res.statusCode = upstreamResponse.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Proxy internal server error', details: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    geminiBackendProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg', 'logo-icon.png', 'icon-192.png', 'icon-512.png', 'favicon.svg'],
      manifest: {
        name: 'PitchBoss — Domina el pitch en cualquier industria',
        short_name: 'PitchBoss',
        description: 'Simulador de roleplay por voz en inglés para dominar el pitch y cerrar tratos en cualquier nicho de negocio',
        theme_color: '#12161f',
        background_color: '#12161f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
})
