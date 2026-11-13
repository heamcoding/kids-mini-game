import { BASE } from './defaults'
import type { Settings } from './types'

const KEY = 'mongsil-settings'

const num = (v: unknown, min: number, max: number, def: number) => {
  const n = typeof v === 'number' ? v : Number(v)
  if (v === undefined || v === null || v === '' || !Number.isFinite(n)) return def
  return Math.min(max, Math.max(min, n))
}

export function clampSettings(s: Partial<Settings>): Settings {
  const m = { ...BASE, ...s }
  return {
    age: m.age === 3 || m.age === 4 || m.age === 5 ? m.age : null,
    scan: num(m.scan, 1, 5, BASE.scan),
    touchTime: num(m.touchTime, 5, 30, BASE.touchTime),
    control: m.control === 'touch' || m.control === 'space' ? m.control : 'both',
    voiceVol: num(m.voiceVol, 0, 100, BASE.voiceVol),
    fxVol: num(m.fxVol, 0, 100, BASE.fxVol),
    rounds: Math.round(num(m.rounds, 1, 10, BASE.rounds)),
    rate: num(m.rate, 0.5, 1.3, BASE.rate),
    pitch: num(m.pitch, 0.6, 1.8, BASE.pitch),
    gap: num(m.gap, 0, 2, BASE.gap),
    voiceName: typeof m.voiceName === 'string' ? m.voiceName.slice(0, 200) : '',
  }
}

export function loadLocal(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') return clampSettings(parsed)
    }
  } catch { /* fall through */ }
  return { ...BASE }
}

export function saveLocal(s: Settings): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

const PENDING = 'mongsil-settings-pending'

/** True while a local edit has not been confirmed by a successful PUT. */
export function isPending(): boolean {
  try { return localStorage.getItem(PENDING) === '1' } catch { return false }
}

export function setPending(b: boolean): void {
  try {
    if (b) localStorage.setItem(PENDING, '1')
    else localStorage.removeItem(PENDING)
  } catch { /* ignore */ }
}
