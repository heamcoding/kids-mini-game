import { render } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BASE } from '../settings/defaults'
import { getDeviceId } from '../settings/deviceId'
import type { GameProps } from '../shell/games'
import { recordPlay } from './recordPlay'
import { withRecordPlay } from './withRecordPlay'

beforeEach(() => vi.useFakeTimers())
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

it('POSTs the record with the device id', async () => {
  const f = vi.fn(async () => new Response('{"id":1}', { status: 201 }))
  vi.stubGlobal('fetch', f)
  await recordPlay({ gameId: 'fruit', age: 4, durationMs: 1234, completed: true })
  const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe('/api/records')
  expect(init.method).toBe('POST')
  expect((init.headers as Record<string, string>)['X-Device-Id']).toBe(getDeviceId())
  expect(JSON.parse(init.body as string)).toEqual({ game_id: 'fruit', age: 4, duration_ms: 1234, completed: true })
})

it('resolves when fetch rejects or throws', async () => {
  vi.stubGlobal('fetch', () => Promise.reject(new Error('down')))
  await expect(recordPlay({ gameId: 'x', age: 3, durationMs: 0, completed: true })).resolves.toBeUndefined()
  vi.stubGlobal('fetch', () => { throw new Error('sync') })
  await expect(recordPlay({ gameId: 'x', age: 3, durationMs: 0, completed: true })).resolves.toBeUndefined()
})

it('gives up on a hanging server after ~3s', async () => {
  let aborted = false
  vi.stubGlobal('fetch', (_u: string, init: RequestInit) => new Promise((_res, rej) => {
    init.signal!.addEventListener('abort', () => { aborted = true; rej(new DOMException('aborted', 'AbortError')) })
  }))
  const p = recordPlay({ gameId: 'x', age: 3, durationMs: 0, completed: true })
  await vi.advanceTimersByTimeAsync(2999)
  expect(aborted).toBe(false)
  await vi.advanceTimersByTimeAsync(1)
  expect(aborted).toBe(true)
  await expect(p).resolves.toBeUndefined()
})

it('a game finishing calls onFinish right away even if the server hangs or rejects', () => {
  for (const fetchImpl of [() => new Promise(() => {}), () => Promise.reject(new Error('down'))]) {
    const f = vi.fn(fetchImpl)
    vi.stubGlobal('fetch', f)
    function Inner({ onFinish }: GameProps) { useEffect(() => { onFinish('끝!') }, [onFinish]); return null }
    const Wrapped = withRecordPlay('chick', Inner)
    const onFinish = vi.fn()
    vi.setSystemTime(10_000)
    const { unmount } = render(<Wrapped settings={{ ...BASE, age: 5 }} engine={{} as GameProps['engine']} onFinish={onFinish} onHome={() => {}} />)
    expect(onFinish).toHaveBeenCalledWith('끝!')
    expect(f).toHaveBeenCalledTimes(1)
    const body = JSON.parse((f.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)
    expect(body).toMatchObject({ game_id: 'chick', age: 5, completed: true })
    unmount()
  }
})

it('a double onFinish records once and reaches the shell once', () => {
  const f = vi.fn(async () => new Response('{"id":1}', { status: 201 }))
  vi.stubGlobal('fetch', f)
  function Twice({ onFinish }: GameProps) { useEffect(() => { onFinish('a'); onFinish('b') }, [onFinish]); return null }
  const Wrapped = withRecordPlay('owl', Twice)
  const onFinish = vi.fn()
  render(<Wrapped settings={{ ...BASE, age: 4 }} engine={{} as GameProps['engine']} onFinish={onFinish} onHome={() => {}} />)
  expect(onFinish).toHaveBeenCalledTimes(1)
  expect(onFinish).toHaveBeenCalledWith('a')
  expect(f).toHaveBeenCalledTimes(1)
})
