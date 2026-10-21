import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { registerSW } from 'virtual:pwa-register'

// Auto update PWA when new version is deployed
let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined
updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    if (updateSW) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('PitchBoss PWA ready for offline usage')
  }
})

// Auto-reload on chunk loading error (prevents blank screen on redeploy)
window.addEventListener('vite:preloadError', () => {
  console.warn('PitchBoss: New version detected, reloading to fetch latest assets...')
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <App />
)

