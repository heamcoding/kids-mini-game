import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BASE } from './defaults'
import { useSettings } from './useSettings'

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

describe('useSettings', () => {
  it('stays on local values and goes offline when fetch rejects', async () => {
    localStorage.setItem('mongsil-settings', JSON.stringify({ rounds: 4 }))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
    expect(result.current.settings).toEqual({ ...BASE, rounds: 4 })
  })

  it('writes localStorage on update even while the server fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
    act(() => result.current.update({ rounds: 7 }))
    expect(result.current.settings.rounds).toBe(7)
    expect(JSON.parse(localStorage.getItem('mongsil-settings')!).rounds).toBe(7)
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
  })

  it('prefers server values over localStorage on 200', async () => {
    localStorage.setItem('mongsil-settings', JSON.stringify({ rounds: 4 }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...BASE, rounds: 9 }) }))
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))
    expect(result.current.settings.rounds).toBe(9)
    expect(JSON.parse(localStorage.getItem('mongsil-settings')!).rounds).toBe(9)
  })

  it('retries pending push on the online event', async () => {
    const f = vi.fn().mockRejectedValue(new Error('down'))
    vi.stubGlobal('fetch', f)
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
    act(() => result.current.update({ rounds: 6 }))
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
    f.mockResolvedValue({ ok: true, json: async () => ({}), status: 200 })
    act(() => { window.dispatchEvent(new Event('online')) })
    await waitFor(() => expect(result.current.syncState).toBe('synced'))
    const put = f.mock.calls.filter(c => c[1]?.method === 'PUT').pop()!
    expect(JSON.parse(put[1].body).rounds).toBe(6)
    expect(put[1].headers['X-Device-Id']).toBeTruthy()
  })

  const putBodies = (f: ReturnType<typeof vi.fn>) =>
    f.mock.calls.filter(c => c[1]?.method === 'PUT').map(c => JSON.parse(c[1].body))

  it('keeps an unsent offline edit after reload and pushes it', async () => {
    const down = vi.fn().mockRejectedValue(new Error('down'))
    vi.stubGlobal('fetch', down)
    const first = renderHook(() => useSettings())
    await waitFor(() => expect(first.result.current.syncState).toBe('offline'))
    act(() => first.result.current.update({ rounds: 7 }))
    first.unmount()
    const f = vi.fn().mockImplementation(async (_u: string, o?: RequestInit) =>
      o?.method === 'PUT' ? { ok: true, status: 200 } : { ok: true, status: 200, json: async () => ({ ...BASE }) })
    vi.stubGlobal('fetch', f)
    const second = renderHook(() => useSettings())
    await waitFor(() => expect(second.result.current.syncState).toBe('synced'))
    expect(second.result.current.settings.rounds).toBe(7)
    expect(putBodies(f).pop().rounds).toBe(7)
    expect(JSON.parse(localStorage.getItem('mongsil-settings')!).rounds).toBe(7)
    expect(localStorage.getItem('mongsil-settings-pending')).not.toBe('1')
  })

  it('local pending value wins over a 200 default server response', async () => {
    localStorage.setItem('mongsil-settings', JSON.stringify({ ...BASE, rounds: 8 }))
    localStorage.setItem('mongsil-settings-pending', '1')
    const f = vi.fn().mockImplementation(async (_u: string, o?: RequestInit) =>
      o?.method === 'PUT' ? { ok: true, status: 200 } : { ok: true, status: 200, json: async () => ({ ...BASE }) })
    vi.stubGlobal('fetch', f)
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))
    expect(result.current.settings.rounds).toBe(8)
    expect(putBodies(f).pop().rounds).toBe(8)
  })

  it('treats a 5xx response as offline and keeps local values', async () => {
    localStorage.setItem('mongsil-settings', JSON.stringify({ rounds: 4 }))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
    expect(result.current.settings.rounds).toBe(4)
  })

  it('clamps an out-of-range server response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ ...BASE, rounds: 0, voiceVol: 500 }) }))
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))
    expect(result.current.settings.rounds).toBe(1)
    expect(result.current.settings.voiceVol).toBe(100)
  })

  it('serializes PUTs so a slow first PUT cannot land after the second', async () => {
    let releaseFirst!: () => void
    let puts = 0
    const f = vi.fn().mockImplementation(async (_u: string, o?: RequestInit) => {
      if (o?.method !== 'PUT') return { ok: true, status: 200, json: async () => ({ ...BASE }) }
      if (puts++ === 0) await new Promise<void>(r => { releaseFirst = r })
      return { ok: true, status: 200 }
    })
    vi.stubGlobal('fetch', f)
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))
    act(() => result.current.update({ rounds: 2 }))
    act(() => result.current.update({ rounds: 3 }))
    await new Promise(r => setTimeout(r, 20))
    expect(putBodies(f)).toHaveLength(1)
    await act(async () => { releaseFirst() })
    await waitFor(() => expect(putBodies(f)).toHaveLength(2))
    expect(putBodies(f).pop().rounds).toBe(3)
    await waitFor(() => expect(localStorage.getItem('mongsil-settings-pending')).not.toBe('1'))
  })

  it('stays pending when an earlier PUT succeeds but the latest fails', async () => {
    let puts = 0
    const f = vi.fn().mockImplementation(async (_u: string, o?: RequestInit) => {
      if (o?.method !== 'PUT') return { ok: true, status: 200, json: async () => ({ ...BASE }) }
      if (puts++ === 0) return { ok: true, status: 200 }
      throw new Error('down')
    })
    vi.stubGlobal('fetch', f)
    const { result } = renderHook(() => useSettings())
    await waitFor(() => expect(result.current.syncState).toBe('synced'))
    act(() => result.current.update({ rounds: 2 }))
    await waitFor(() => expect(puts).toBe(1))
    act(() => result.current.update({ rounds: 3 }))
    await waitFor(() => expect(result.current.syncState).toBe('offline'))
    expect(localStorage.getItem('mongsil-settings-pending')).toBe('1')
  })
})
