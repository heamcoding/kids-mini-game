import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { fetchSettings, pushSettings, SETTINGS_TIMEOUT_MS } from './api'
import { BASE } from './defaults'

beforeEach(() => vi.useFakeTimers())
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

const hanging = () => (_u: string, init: RequestInit) => new Promise((_res, rej) => {
  init.signal!.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError')))
})

it('fetchSettings and pushSettings reject after the timeout', async () => {
  vi.stubGlobal('fetch', hanging())
  for (const call of [() => fetchSettings(), () => pushSettings({ ...BASE })]) {
    const p = call()
    const assertion = expect(p).rejects.toBeDefined()
    await vi.advanceTimersByTimeAsync(SETTINGS_TIMEOUT_MS - 1)
    let settled = false
    p.then(() => { settled = true }, () => { settled = true })
    await vi.advanceTimersByTimeAsync(0)
    expect(settled).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    await assertion
  }
})
