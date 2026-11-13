import { getDeviceId } from '../settings/deviceId'

export type PlayRecord = { gameId: string; age: number | null; durationMs: number; completed: boolean }

const base = () => import.meta.env.VITE_FASTAPI_URL ?? 'http://localhost:8000'
export const RECORD_TIMEOUT_MS = 3000

/** POST a play record to FastAPI. Never rejects: the game must not care if the server is down or slow. */
export async function recordPlay({ gameId, age, durationMs, completed }: PlayRecord): Promise<void> {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null
  const t = setTimeout(() => ctl?.abort(), RECORD_TIMEOUT_MS)
  try {
    await fetch(`${base()}/records`, {
      method: 'POST',
      headers: { 'X-Device-Id': getDeviceId(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, age, duration_ms: Math.max(0, Math.round(durationMs)), completed }),
      signal: ctl?.signal,
    })
  } catch {
    /* offline / timeout: ignore */
  } finally {
    clearTimeout(t)
  }
}
