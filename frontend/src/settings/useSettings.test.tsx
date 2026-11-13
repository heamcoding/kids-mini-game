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
})
