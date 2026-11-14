import { act } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GameProps } from '../shell/games'
import Chick from './chick/Game'
import Fruit from './fruit/Game'
import Owl from './owl/Game'
import { setRandom } from './shared/random'
import Squirrel from './squirrel/Game'
import { bubble, drive, firstThen, labelOf, mount, mulberry32, tick, type Answer } from './test/harness'

beforeEach(() => vi.useFakeTimers())
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); setRandom(Math.random); document.body.innerHTML = '' })

const idx = (items: HTMLElement[], label: string) => items.findIndex(e => labelOf(e) === label)

/** Correct-answer strategies (fresh per game run, some need memory). */
const STRATEGY: Record<string, () => Answer> = {
  fruit: () => (items, b) => {
    if (items.length === 1 && labelOf(items[0]) === '주사위 굴리기') return 0
    const m = b.match(/^(.+) 어디 있지\?$/)
    return m ? idx(items, m[1]) : null
  },
  chick: () => items => {
    const n = document.querySelectorAll('img[alt="병아리"]').length
    return idx(items, String(n))
  },
  owl: () => (items, b) => {
    if (items.length === 1 && labelOf(items[0]) === '카드 뒤집기') return 0
    const m = b.match(/^(\S+) 칸을 찾아 봐!$/)
    return m ? idx(items, m[1] + ' 칸') : null
  },
  squirrel: () => {
    let target = ''
    return (items, b) => {
      if (items.length === 1 && labelOf(items[0]) === '돌림판 돌리기') return 0
      const m = b.match(/^(\S+) 도토리!$/)
      if (m) target = m[1] + ' 도토리'
      return target ? idx(items, target) : null
    }
  },
}

/** First multi-option answer is deliberately wrong. */
function wrongFirst(a: Answer): Answer {
  let done = false
  return (items, b) => {
    const i = a(items, b)
    if (done || i === null || i < 0 || items.length < 2) return i
    done = true
    return i === 0 ? 1 : 0
  }
}

const WRONG_SAID: Record<string, RegExp> = {
  fruit: /^이건 .+\. .+ 찾아볼까\?$/,
  chick: /^다시 같이 세어 보자\.$/,
  owl: /^(이건 \S+ 칸이야\.|그건 너무 멀리 있어\. 가까이 있는 거 찾아 줘!)$/,
  squirrel: /^이건 \S+ 도토리야\.$/,
}

const FIRST_PROMPT: Record<string, string> = {
  fruit: '까마귀가 과일 먹으러 나무에 오고 있어! 까마귀가 오기 전에 과일을 다 따서 바구니에 담자. 주사위를 눌러 봐!',
  chick: '병아리가 나와요! 같이 세어 보자.',
  owl: '카드를 뒤집어 봐!',
  squirrel: '돌림판을 돌려 봐!',
}

const GAMES: [string, ComponentType<GameProps>][] = [['fruit', Fruit], ['chick', Chick], ['owl', Owl], ['squirrel', Squirrel]]
const rngFor = (id: string) => (id === 'fruit' ? firstThen(0.99, 7) : mulberry32(42))

async function playToEnd(id: string, Game: ComponentType<GameProps>, opts: { age: 3 | 4 | 5; random: () => number; strict?: boolean; wrong?: boolean }) {
  const m = mount(id, Game, opts)
  const base = STRATEGY[id]()
  await drive(m, opts.wrong ? wrongFirst(base) : base, () => m.onFinish.mock.calls.length > 0)
  await tick(20_000) // nothing more may happen after the finish
  return m
}

function expectOneFinish(m: Awaited<ReturnType<typeof playToEnd>>, id: string, age: number) {
  expect(m.onFinish).toHaveBeenCalledTimes(1)
  expect(m.records()).toHaveLength(1)
  expect(m.records()[0]).toMatchObject({ game_id: id, age, completed: true })
}

describe.each(GAMES)('%s end to end', (id, Game) => {
  it.each([3, 4, 5] as const)('age %i: plays to exactly one finish and one record', async age => {
    const m = await playToEnd(id, Game, { age, random: rngFor(id) })
    expectOneFinish(m, id, age)
  })

  it('a wrong pick is answered and the game carries on to the finish', async () => {
    const m = await playToEnd(id, Game, { age: 3, random: rngFor(id), wrong: true })
    expect(m.says.some(t => WRONG_SAID[id].test(t))).toBe(true)
    expectOneFinish(m, id, 3)
  })

  it('StrictMode does not start the game twice', async () => {
    const m = mount(id, Game, { age: 3, random: rngFor(id), strict: true })
    await drive(m, () => null, () => m.engine.chooser.isActive(), 60_000)
    expect(m.says.filter(t => t === FIRST_PROMPT[id])).toHaveLength(1)
    await drive(m, STRATEGY[id](), () => m.onFinish.mock.calls.length > 0)
    await tick(20_000)
    expectOneFinish(m, id, 3)
  })

  it('unmounting mid-game leaves no overlays, no timers and no late finish', async () => {
    const m = mount(id, Game, { age: 4, random: rngFor(id) })
    const base = STRATEGY[id]()
    let picks = 0
    await drive(m, (it, b) => { const i = base(it, b); if (i !== null && i >= 0) picks++; return i }, () => picks >= 3)
    await drive(m, () => null, () => m.engine.chooser.isActive(), 60_000) // unmount while a choice is armed
    expect(m.engine.chooser.isActive()).toBe(true)
    expect(m.onFinish).not.toHaveBeenCalled()
    const saidBefore = m.says.length
    m.unmount()
    expect(document.querySelectorAll('[data-ov]')).toHaveLength(0)
    expect(m.engine.chooser.isActive()).toBe(false)
    await act(async () => { await vi.runAllTimersAsync() })
    expect(vi.getTimerCount()).toBe(0)
    expect(m.onFinish).not.toHaveBeenCalled()
    expect(m.says.length).toBe(saidBefore)
    expect(document.querySelectorAll('[data-ov]')).toHaveLength(0)
  })
})

describe('fruit endings', () => {
  it('raven wins when the die plan says so', async () => {
    const m = await playToEnd('fruit', Fruit, { age: 3, random: firstThen(0, 3) })
    expect(m.onFinish).toHaveBeenCalledWith('다음엔 더 빨리 따 보자!')
    expectOneFinish(m, 'fruit', 3)
  })

  it('the kid wins otherwise', async () => {
    const m = await playToEnd('fruit', Fruit, { age: 3, random: firstThen(0.99, 3) })
    expect(m.onFinish).toHaveBeenCalledWith('과일을 다 땄어! 모두 성공!')
    expectOneFinish(m, 'fruit', 3)
  })
})

describe('fruit fly-to-basket (fixed original bug)', () => {
  let frames: Map<number, FrameRequestCallback>
  let cancel: ReturnType<typeof vi.fn>
  beforeEach(() => {
    frames = new Map()
    let n = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.set(++n, cb); return n })
    cancel = vi.fn((i: number) => { frames.delete(i) })
    vi.stubGlobal('cancelAnimationFrame', cancel)
  })
  const flushFrames = () => { const fs = [...frames.values()]; frames.clear(); fs.forEach(f => f(0)) }

  async function toFirstFruitPick() {
    const m = mount('fruit', Fruit, { age: 3, random: firstThen(0.99, 5) })
    const answer = STRATEGY.fruit()
    await drive(m, (it, b) => (/어디 있지/.test(b) ? null : answer(it, b)), () => m.engine.chooser.isActive() && /어디 있지\?$/.test(bubble()))
    const i = answer(m.engine.chooser.items(), bubble())!
    act(() => { m.engine.chooser.pick(i) })
    return m
  }
  const clones = () => [...document.querySelectorAll<HTMLImageElement>('img[data-ov]')].filter(e => e.style.zIndex === '40')

  it('a picked fruit flies into the basket, then the basket pops', async () => {
    await toFirstFruitPick()
    expect(clones()).toHaveLength(1)
    const c = clones()[0]
    expect(c.style.position).toBe('fixed')
    expect(c.style.transform).toBe('')
    expect(frames.size).toBe(1)
    act(() => flushFrames())
    expect(c.style.transform).toBe('scale(.7)')
    const box = document.querySelector('img[alt="바구니"]')!.parentElement!
    await tick(600)
    expect(clones()).toHaveLength(1)
    expect(box.classList.contains('pop')).toBe(false)
    await tick(50)
    expect(clones()).toHaveLength(0)
    expect(box.classList.contains('pop')).toBe(true)
    expect(document.querySelector('img[alt="바구니"]')!.getAttribute('src')).toContain('basket_full')
  })

  it('unmounting mid-flight removes the clone and fires nothing afterwards', async () => {
    const m = await toFirstFruitPick()
    expect(clones()).toHaveLength(1)
    m.unmount()
    expect(clones()).toHaveLength(0)
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(frames.size).toBe(0)
    await act(async () => { await vi.runAllTimersAsync() })
    expect(vi.getTimerCount()).toBe(0)
    expect(document.querySelectorAll('[data-ov]')).toHaveLength(0)
    expect(m.onFinish).not.toHaveBeenCalled()
  })
})

describe('speech callbacks after unmount (M1)', () => {
  it('chick: a pending say() callback does not run after unmount', async () => {
    const m = mount('chick', Chick, { age: 3, random: mulberry32(1) })
    await tick(0)
    expect(m.says).toEqual(['병아리가 나와요! 같이 세어 보자.'])
    const choose = vi.spyOn(m.engine, 'choose')
    m.unmount()
    await act(async () => { await vi.runAllTimersAsync() })
    expect(m.says).toEqual(['병아리가 나와요! 같이 세어 보자.'])
    expect(choose).not.toHaveBeenCalled()
  })
})
