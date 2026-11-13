import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSettings, pushSettings } from './api'
import { clampSettings, isPending, loadLocal, saveLocal, setPending } from './storage'
import type { Settings } from './types'

export type SyncState = 'idle' | 'offline' | 'synced'

export function useSettings(): { settings: Settings; update(patch: Partial<Settings>): void; syncState: SyncState } {
  const [settings, setSettings] = useState<Settings>(loadLocal)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const ref = useRef(settings)
  const version = useRef(0)
  const inflight = useRef(false)
  const queued = useRef(false)
  const alive = useRef(true)

  // At most one PUT in flight; edits made meanwhile coalesce into one follow-up PUT of the latest value.
  const flush = useCallback(async () => {
    if (inflight.current) { queued.current = true; return }
    inflight.current = true
    try {
      do {
        queued.current = false
        const v = version.current
        try {
          await pushSettings(ref.current)
          if (version.current === v) setPending(false)
          if (alive.current) setSyncState(isPending() ? 'offline' : 'synced')
        } catch {
          if (alive.current) setSyncState('offline')
        }
      } while (queued.current && alive.current)
    } finally {
      inflight.current = false
    }
  }, [])

  const pull = useCallback(async () => {
    try {
      const s = await fetchSettings()
      if (!alive.current) return
      if (isPending()) { await flush(); return }
      ref.current = s
      saveLocal(s)
      setSettings(s)
      setSyncState('synced')
    } catch {
      if (alive.current) setSyncState('offline')
    }
  }, [flush])

  useEffect(() => {
    alive.current = true
    const sync = () => { void (isPending() ? flush() : pull()) }
    sync()
    window.addEventListener('online', sync)
    return () => { alive.current = false; window.removeEventListener('online', sync) }
  }, [pull, flush])

  const update = useCallback((patch: Partial<Settings>) => {
    const next = clampSettings({ ...ref.current, ...patch })
    ref.current = next
    version.current++
    saveLocal(next)
    setPending(true)
    setSettings(next)
    void flush()
  }, [flush])

  return { settings, update, syncState }
}
