import { useEffect, useState } from 'react'

type InstallEvt = Event & { prompt(): Promise<void>; userChoice: Promise<unknown> }

export const isStandalone = (): boolean => {
  try {
    return matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
  } catch { return false }
}
export const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

let evt: InstallEvt | null = null
let swOk = false
const subs = new Set<() => void>()
export const isSwOk = (): boolean => swOk
export function setSwOk(): void { swOk = true; subs.forEach(f => f()) }

export type InstallMode = 'standalone' | 'prompt' | 'ios' | 'menu' | 'unavailable'
export function installMode(s: { standalone: boolean; canInstall: boolean; ios: boolean; swOk: boolean }): InstallMode {
  if (s.standalone) return 'standalone'
  if (s.canInstall) return 'prompt'
  if (s.ios) return 'ios'
  return s.swOk ? 'menu' : 'unavailable'
}
if (typeof window !== 'undefined') {
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); evt = e as InstallEvt; subs.forEach(f => f()) })
  addEventListener('appinstalled', () => { evt = null; subs.forEach(f => f()) })
}

export function useInstall(): { canInstall: boolean; install(): Promise<void> } {
  const [, force] = useState(0)
  useEffect(() => {
    const f = () => force(n => n + 1)
    subs.add(f)
    return () => { subs.delete(f) }
  }, [])
  return {
    canInstall: !!evt,
    async install() {
      try { await evt?.prompt(); await evt?.userChoice } catch { /* dismissed */ }
      evt = null
      subs.forEach(f => f())
    },
  }
}
