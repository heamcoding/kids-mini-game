import { setSwOk } from './shell/install'

/**
 * Registers ./sw.js in production builds only. Errors (unsupported, insecure
 * origin, blocked) are swallowed: the game works fine without the SW.
 * Updating installed apps: bump CACHE in public/sw.js; the new worker
 * skipWaiting()s, claims clients and deletes the old cache on activate.
 */
export function registerSw(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  try {
    navigator.serviceWorker.register('./sw.js').then(() => setSwOk(), () => { /* ignore */ })
  } catch { /* ignore */ }
}
