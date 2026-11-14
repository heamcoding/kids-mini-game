import { apiUrl } from '../apiUrl'
import { getDeviceId } from '../settings/deviceId'
import { fetchWithTimeout } from '../settings/fetchWithTimeout'

export type PlayRecord = { gameId: string; age: number | null; durationMs: number; completed: boolean }

export const RECORD_TIMEOUT_MS = 3000

/** POST a play record to FastAPI. Never rejects: the game must not care if the server is down or slow. */
export async function recordPlay({ gameId, age, durationMs, completed }: PlayRecord): Promise<void> {
  try {
    await fetchWithTimeout(apiUrl('/api/records'), {
      method: 'POST',
      headers: { 'X-Device-Id': getDeviceId(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId, age, duration_ms: Math.max(0, Math.round(durationMs)), completed }),
    }, RECORD_TIMEOUT_MS)
  } catch {
    /* offline / timeout: ignore */
  }
}
