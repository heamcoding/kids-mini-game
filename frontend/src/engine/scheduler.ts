export type Scheduler = {
  token(): number
  bump(): number
  later(fn: () => void, ms: number): number
  isPaused(): boolean
  setPaused(b: boolean): void
}

export function createScheduler(opts: { isSpeaking?: () => boolean } = {}): Scheduler {
  let token = 0
  let paused = false
  return {
    token: () => token,
    bump: () => ++token,
    isPaused: () => paused,
    setPaused: b => { paused = b },
    later(fn, ms) {
      const t = token
      const go = () => {
        if (t !== token || paused) return
        if (opts.isSpeaking?.()) { setTimeout(go, 120); return }
        fn()
      }
      return setTimeout(go, ms) as unknown as number
    },
  }
}
