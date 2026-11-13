import { clampSettings } from './storage'
import { getDeviceId } from './deviceId'
import type { Settings } from './types'

const base = () => import.meta.env.VITE_SPRING_URL || 'http://localhost:8080'
const headers = () => ({ 'X-Device-Id': getDeviceId(), 'Content-Type': 'application/json' })

export async function fetchSettings(): Promise<Settings> {
  const r = await fetch(`${base()}/api/settings`, { headers: headers() })
  if (!r.ok) throw new Error(`GET /api/settings ${r.status}`)
  return clampSettings(await r.json())
}

export async function pushSettings(s: Settings): Promise<void> {
  const r = await fetch(`${base()}/api/settings`, { method: 'PUT', headers: headers(), body: JSON.stringify(s) })
  if (!r.ok) throw new Error(`PUT /api/settings ${r.status}`)
}
