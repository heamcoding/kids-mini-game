import { act, render, screen } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createEngine } from '../engine'
import { EngineProvider } from '../engine/context'
import { BASE } from '../settings/defaults'
import type { Settings } from '../settings/types'
import type { GameProps } from '../shell/games'
import Abc from './abc/Game'
import Bear from './bear/Game'
import Fruit from './fruit/Game'
import Kor from './kor/Game'
import Memory from './memory/Game'
import Mole from './mole/Game'
import Num from './num/Game'
import Pop from './pop/Game'
import Same from './same/Game'
import Size from './size/Game'
import Chick from './chick/Game'
import Owl from './owl/Game'
import Squirrel from './squirrel/Game'

const GAMES: [string, ComponentType<GameProps>][] = [['fruit', Fruit], ['chick', Chick], ['owl', Owl], ['squirrel', Squirrel], ['pop', Pop], ['memory', Memory], ['same', Same], ['bear', Bear], ['mole', Mole], ['size', Size], ['num', Num], ['abc', Abc], ['kor', Kor]]

beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('fetch', () => Promise.reject(new Error('offline'))) })
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); document.body.innerHTML = '' })

describe.each(GAMES)('%s', (_id, Game) => {
  it.each([3, 4, 5] as const)('renders at age %i and arms a choice', async age => {
    const settings: Settings = { ...BASE, age, voiceVol: 0 }
    const engine = createEngine(() => settings)
    const onFinish = vi.fn()
    render(
      <EngineProvider engine={engine}>
        <Game settings={settings} engine={engine} onFinish={onFinish} onHome={() => {}} />
      </EngineProvider>,
    )
    await act(async () => { await vi.advanceTimersByTimeAsync(0) })
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
    // Let intro speech and question setup run; something must become choosable.
    for (let i = 0; i < 40 && !engine.chooser.isActive(); i++) await act(async () => { await vi.advanceTimersByTimeAsync(500) })
    expect(engine.chooser.isActive()).toBe(true)
    expect(onFinish).not.toHaveBeenCalled()
  })
})
