import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { registerSW } from 'virtual:pwa-register'

// Auto update PWA when new version is deployed
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log('PitchBoss PWA ready for offline usage')
  }
})

createRoot(document.getElementById('root')!).render(
  <App />
)
