import { act, render } from '@testing-library/react'
import { StrictMode, type ComponentType } from 'react'
import { vi } from 'vitest'
import { createEngine, type Engine } from '../../engine'
import { EngineProvider } from '../../engine/context'
import { BASE } from '../../settings/defaults'
import type { Settings } from '../../settings/types'
import type { GameProps } from '../../shell/games'
import { setRandom } from '../shared/random'
import { withRecordPlay } from '../withRecordPlay'

/** Deterministic PRNG for tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** First draw is `first`, the rest come from a seeded PRNG (fruit: first draw decides raven-wins). */
export const firstThen = (first: number, seed = 1) => {
  const p = mulberry32(seed)
  let used = false
  return () => (used ? p() : ((used = true), first))
}

export type Mounted = {
  engine: Engine
  onFinish: ReturnType<typeof vi.fn>
  says: string[]
  records: () => unknown[]
  unmount(): void
}

/** Render a game the way the shell does (wrapped in withRecordPlay) with fetch and randomness stubbed. */
export function mount(id: string, Game: ComponentType<GameProps>, opts: { age: 3 | 4 | 5; random: () => number; strict?: boolean }): Mounted {
  setRandom(opts.random)
  const fetchMock = vi.fn(async (_u: string, _i?: RequestInit) => new Response('{"id":1}', { status: 201 }))
  vi.stubGlobal('fetch', fetchMock)
  const settings: Settings = { ...BASE, age: opts.age, voiceVol: 0, fxVol: 0, control: 'both' }
  const engine = createEngine(() => settings)
  const says: string[] = []
  const origSay = engine.say
  engine.say = (t, show, cb) => { says.push(t); origSay(t, show, cb) }
  const onFinish = vi.fn()
  const Wrapped = withRecordPlay(id, Game)
  const tree = (
    <EngineProvider engine={engine}>
      <Wrapped settings={settings} engine={engine} onFinish={onFinish} onHome={() => {}} />
    </EngineProvider>
  )
  const r = render(opts.strict ? <StrictMode>{tree}</StrictMode> : tree)
  return {
    engine,
    onFinish,
    says,
    records: () => fetchMock.mock.calls.filter(c => String(c[0]).endsWith('/records')).map(c => JSON.parse(String(c[1]?.body))),
    unmount: () => r.unmount(),
  }
}

export const bubble = () => document.getElementById('bubble')?.textContent ?? ''
export const labelOf = (el: HTMLElement) => el.getAttribute('aria-label') ?? ''

/** Answer strategy: given the armed items, return the index to pick or null to wait. */
export type Answer = (items: HTMLElement[], bubble: string) => number | null

export async function tick(ms = 100) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms) })
}

/** Advance time, answering every armed choice via engine.chooser.pick, until `done()` or `maxMs`. */
export async function drive(m: Mounted, answer: Answer, done: () => boolean, maxMs = 600_000) {
  for (let t = 0; t < maxMs && !done(); t += 100) {
    await tick(100)
    if (!m.engine.chooser.isActive()) continue
    const i = answer(m.engine.chooser.items(), bubble())
    if (i !== null && i >= 0) act(() => { m.engine.chooser.pick(i) })
  }
}
