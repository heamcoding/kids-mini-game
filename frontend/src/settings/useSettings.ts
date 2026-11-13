import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSettings, pushSettings } from './api'
import { clampSettings, loadLocal, saveLocal } from './storage'
import type { Settings } from './types'

export type SyncState = 'idle' | 'offline' | 'synced'

export function useSettings(): { settings: Settings; update(patch: Partial<Settings>): void; syncState: SyncState } {
  const [settings, setSettings] = useState<Settings>(loadLocal)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const ref = useRef(settings)
  const dirty = useRef(false)
  const alive = useRef(true)

  const push = useCallback(async () => {
    try {
      await pushSettings(ref.current)
      dirty.current = false
      if (alive.current) setSyncState('synced')
    } catch {
      if (alive.current) setSyncState('offline')
    }
  }, [])

  const pull = useCallback(async () => {
    try {
      const s = await fetchSettings()
      if (!alive.current) return
      if (dirty.current) { await push(); return }
      ref.current = s
      saveLocal(s)
      setSettings(s)
      setSyncState('synced')
    } catch {
      if (alive.current) setSyncState('offline')
    }
  }, [push])

  useEffect(() => {
    alive.current = true
    void pull()
    const onOnline = () => { void (dirty.current ? push() : pull()) }
    window.addEventListener('online', onOnline)
    return () => { alive.current = false; window.removeEventListener('online', onOnline) }
  }, [pull, push])

  const update = useCallback((patch: Partial<Settings>) => {
    const next = clampSettings({ ...ref.current, ...patch })
    ref.current = next
    saveLocal(next)
    setSettings(next)
    dirty.current = true
    void push()
  }, [push])

  return { settings, update, syncState }
}
