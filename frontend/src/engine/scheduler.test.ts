import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createScheduler } from './scheduler'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('scheduler', () => {
  it('runs later fn', () => {
    const s = createScheduler(); const f = vi.fn()
    s.later(f, 100); vi.advanceTimersByTime(100)
    expect(f).toHaveBeenCalledTimes(1)
  })
  it('bump cancels earlier later', () => {
    const s = createScheduler(); const f = vi.fn()
    s.later(f, 100); const t = s.token(); expect(s.bump()).toBe(t + 1)
    vi.advanceTimersByTime(1000)
    expect(f).not.toHaveBeenCalled()
  })
  it('paused blocks execution', () => {
    const s = createScheduler(); const f = vi.fn()
    s.setPaused(true); expect(s.isPaused()).toBe(true)
    s.later(f, 100); vi.advanceTimersByTime(1000)
    expect(f).not.toHaveBeenCalled()
  })
  it('waits while speaking, retrying every 120ms', () => {
    let sp = true; const s = createScheduler({ isSpeaking: () => sp }); const f = vi.fn()
    s.later(f, 100); vi.advanceTimersByTime(500)
    expect(f).not.toHaveBeenCalled()
    sp = false; vi.advanceTimersByTime(120)
    expect(f).toHaveBeenCalledTimes(1)
  })
})
