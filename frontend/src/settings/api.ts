import { clampSettings } from './storage'
import { getDeviceId } from './deviceId'
import { fetchWithTimeout } from './fetchWithTimeout'
import type { Settings } from './types'

export const SETTINGS_TIMEOUT_MS = 5000
const base = () => import.meta.env.VITE_SPRING_URL || 'http://localhost:8080'
const headers = () => ({ 'X-Device-Id': getDeviceId(), 'Content-Type': 'application/json' })

export async function fetchSettings(): Promise<Settings> {
  const r = await fetchWithTimeout(`${base()}/api/settings`, { headers: headers() }, SETTINGS_TIMEOUT_MS)
  if (!r.ok) throw new Error(`GET /api/settings ${r.status}`)
  return clampSettings(await r.json())
}

export async function pushSettings(s: Settings): Promise<void> {
  const r = await fetchWithTimeout(`${base()}/api/settings`, { method: 'PUT', headers: headers(), body: JSON.stringify(s) }, SETTINGS_TIMEOUT_MS)
  if (!r.ok) throw new Error(`PUT /api/settings ${r.status}`)
}
