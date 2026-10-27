import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// @ts-ignore
import { handleBackendRoute } from './server/backendLogic.mjs'

/**
 * Dev server backend proxy plugin for PitchBoss.
 * Handles Gemini AI, Cloud Scenarios, Workspaces, Admin Auth and Team Live Audit locally.
 */
function pitchbossBackendPlugin(): Plugin {
  return {
    name: 'pitchboss-backend-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              await handleBackendRoute(req, res, body);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Backend error', details: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    pitchbossBackendPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['logo-icon.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'icon-maskable-512.png', 'favicon.svg'],
      manifest: {
        id: 'pitchboss-ai-pwa',
        name: 'PitchBoss — Domina el pitch en cualquier industria',
        short_name: 'PitchBoss',
        description: 'Simulador de roleplay por voz en inglés para dominar el pitch y cerrar tratos en cualquier nicho de negocio',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#12161f',
        background_color: '#12161f',
        lang: 'es',
        dir: 'ltr',
        categories: ['business', 'education', 'productivity'],
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Iniciar Simulación',
            short_name: 'Simular',
            description: 'Comenzar entrenamiento de pitch con IA',
            url: '/',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Portal Corporativo',
            short_name: 'Empresas',
            description: 'Acceder al portal privado de tu empresa',
            url: '/?view=login',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        globIgnores: ['**/logo.jpg', '**/logo.png', '**/Logopwa.jpg', '**/*.pdf'],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,jpg,webp}']
      }
    })
  ],
})
