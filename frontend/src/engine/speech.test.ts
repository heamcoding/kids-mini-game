import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BASE } from '../settings/defaults'
import { createSpeaker } from './speech'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('speech without speechSynthesis/Audio', () => {
  it('calls cb after fallback time', () => {
    const sp = createSpeaker(() => BASE); const cb = vi.fn()
    expect(() => sp.speak('안녕', cb)).not.toThrow()
    expect(sp.isSpeaking()).toBe(true)
    vi.advanceTimersByTime(10000)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(sp.isSpeaking()).toBe(false)
  })
  it('hush drops pending cb', () => {
    const sp = createSpeaker(() => BASE); const cb = vi.fn()
    sp.speak('안녕', cb); sp.hush()
    vi.advanceTimersByTime(10000)
    expect(cb).not.toHaveBeenCalled()
    expect(sp.isSpeaking()).toBe(false)
  })
  it('empty text calls cb immediately', () => {
    const sp = createSpeaker(() => BASE); const cb = vi.fn()
    sp.speak('  ', cb); expect(cb).toHaveBeenCalledTimes(1)
  })
  it('queues sentences in order, cb after last', () => {
    const sp = createSpeaker(() => ({ ...BASE, voiceVol: 0 })); const cb = vi.fn()
    sp.speak('하나. 둘', cb)
    vi.advanceTimersByTime(20000)
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
