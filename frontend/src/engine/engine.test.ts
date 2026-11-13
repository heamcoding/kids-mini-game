import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Settings } from '../settings/types'
import { BASE } from '../settings/defaults'

vi.mock('./audio', async orig => ({ ...(await orig<typeof import('./audio')>()), setFxVol: vi.fn() }))
import { setFxVol } from './audio'
import { createEngine } from './index'

let s: Settings
beforeEach(() => { s = { ...BASE }; vi.mocked(setFxVol).mockClear(); vi.useFakeTimers() })
afterEach(() => vi.useRealTimers())

describe('createEngine wiring', () => {
  it('pushes fxVol to the audio module on creation and on sync()', () => {
    const e = createEngine(() => s)
    expect(setFxVol).toHaveBeenLastCalledWith(60)
    s = { ...s, fxVol: 25 }
    e.sync()
    expect(setFxVol).toHaveBeenLastCalledWith(25)
  })

  it('settingsOpen pauses the scheduler and blocks the chooser', () => {
    const e = createEngine(() => s)
    const fn = vi.fn()
    const picked = vi.fn()
    const b = document.createElement('button')
    e.choose([b], picked)
    e.setSettingsOpen(true)
    expect(e.scheduler.isPaused()).toBe(true)
    b.click()
    expect(picked).not.toHaveBeenCalled()
    e.later(fn, 10)
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()
    e.setSettingsOpen(false)
    expect(e.scheduler.isPaused()).toBe(false)
    // opening settings stops the chooser (original openSettings); a fresh choose works again once closed
    e.choose([b], picked)
    b.click()
    expect(picked).toHaveBeenCalledTimes(1)
  })

  it('later() waits while the speaker is speaking', () => {
    const e = createEngine(() => ({ ...s, voiceVol: 0 }))
    const fn = vi.fn()
    e.speak('안녕')
    expect(e.speaker.isSpeaking()).toBe(true)
    e.later(fn, 10)
    vi.advanceTimersByTime(100)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(fn).toHaveBeenCalled()
  })

  it('attach() routes the space key to the chooser and cleans up', () => {
    const e = createEngine(() => s)
    const picked = vi.fn()
    e.choose([document.createElement('button')], picked)
    const off = e.attach()
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }))
    expect(picked).toHaveBeenCalledTimes(1)
    off()
    e.choose([document.createElement('button')], picked)
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }))
    expect(picked).toHaveBeenCalledTimes(1)
  })

  it('say() shows the bubble text without pipes', () => {
    const e = createEngine(() => ({ ...s, voiceVol: 0 }))
    e.say('하나 | 둘')
    expect(e.getBubble()).toBe('하나 둘')
    e.say('읽기', '보이기')
    expect(e.getBubble()).toBe('보이기')
  })
})
