import { act } from '@testing-library/react'
import type { ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GameProps } from '../shell/games'
import Chick from './chick/Game'
import Fruit from './fruit/Game'
import Abc from './abc/Game'
import Bear from './bear/Game'
import Kor from './kor/Game'
import Memory from './memory/Game'
import Mole from './mole/Game'
import Num from './num/Game'
import Owl from './owl/Game'
import Pop from './pop/Game'
import Same from './same/Game'
import Size from './size/Game'
import { setRandom } from './shared/random'
import Squirrel from './squirrel/Game'
import { bubble, drive, firstThen, labelOf, mount, mulberry32, tick, type Answer, type Mounted } from './test/harness'

beforeEach(() => vi.useFakeTimers())
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); setRandom(Math.random); document.body.innerHTML = '' })

const idx = (items: HTMLElement[], label: string) => items.findIndex(e => labelOf(e) === label)

/** Correct-answer strategies (fresh per game run, some need memory). */
const STRATEGY: Record<string, (m: Mounted) => Answer> = {
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
  pop: () => items => (items.length ? 0 : null),
  bear: () => items => (items.length ? 0 : null),
  same: () => (items, b) => {
    const m = b.match(/^(?:이건 .+?\. )?(.+) (?:찾아 보자!|어디 있지\?)$/)
    return m ? items.findIndex(e => e.querySelector('img')?.getAttribute('alt') === m[1]) : null
  },
  mole: () => items => (items.length ? 0 : null),
  size: () => (items, b) => {
    const px = (e: HTMLElement) => parseInt(e.querySelector('img')!.style.width)
    const sizes = items.map(px)
    return sizes.indexOf(/^제일 작은/.test(b) ? Math.min(...sizes) : Math.max(...sizes))
  },
  // The bubble shows the answer's sound for num/abc and "잘 듣고 찾아 봐!" for kor, so read what was said.
  num: m => quizAnswer(m),
  abc: m => quizAnswer(m),
  kor: m => quizAnswer(m),
  memory: () => {
    const known = new WeakMap<Element, string>()
    return items => {
      const cards = [...document.querySelectorAll<HTMLElement>('#cards button')]
      const alt = (e: Element) => e.querySelector('img')?.getAttribute('alt') ?? null
      cards.forEach(c => { const a = alt(c); if (a) known.set(c, a) })
      const up = cards.find(c => alt(c) && !c.classList.contains('card-done') && !items.includes(c))
      if (up) {
        const k = items.findIndex(c => known.get(c) === known.get(up))
        if (k >= 0) return k
      }
      const u = items.findIndex(c => !known.has(c))
      return u >= 0 ? u : 0
    }
  },
}

function quizAnswer(m: Mounted): Answer {
  return items => {
    const q = [...m.says].reverse().find(t => /^.+! 어디 있을까\?$/.test(t))
    return q ? items.findIndex(e => labelOf(e) === q.replace(/! 어디 있을까\?$/, '')) : null
  }
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
  same: /^이건 .+\. .+ 어디 있지\?$/,
  size: /^더 (큰|작은) 걸 찾아 볼까\?$/,
  memory: /^다르네\. 다시 덮을게\.$/,
  pop: /./,
  bear: /./,
}

const FIRST_PROMPT: Record<string, string | RegExp> = {
  fruit: '까마귀가 과일 먹으러 나무에 오고 있어! 까마귀가 오기 전에 과일을 다 따서 바구니에 담자. 주사위를 눌러 봐!',
  chick: '병아리가 나와요! 같이 세어 보자.',
  owl: '카드를 뒤집어 봐!',
  squirrel: '돌림판을 돌려 봐!',
  pop: '구멍에 막대를 꽂아 봐! 통을 돌리면 다른 구멍도 나와.',
  bear: '주사위를 눌러 봐!',
  mole: '두더지가 나오면 톡 눌러 봐!',
  memory: '잘 봐! 어디에 누가 있을까?',
}
const FIRST_RE: Record<string, RegExp> = { same: /찾아 보자!$/, size: /찾아 봐!$/, num: /! 어디 있을까\?$/, abc: /! 어디 있을까\?$/, kor: /! 어디 있을까\?$/ }
const isFirstPrompt = (id: string, t: string) => (FIRST_RE[id] ? FIRST_RE[id].test(t) : t === FIRST_PROMPT[id])

const GAMES: [string, ComponentType<GameProps>][] = [['fruit', Fruit], ['chick', Chick], ['owl', Owl], ['squirrel', Squirrel], ['pop', Pop], ['memory', Memory], ['same', Same], ['bear', Bear], ['mole', Mole], ['size', Size], ['num', Num], ['abc', Abc], ['kor', Kor]]
const rngFor = (id: string) => (id === 'fruit' ? firstThen(0.99, 7) : mulberry32(42))

async function playToEnd(id: string, Game: ComponentType<GameProps>, opts: { age: 3 | 4 | 5; random: () => number; strict?: boolean; wrong?: boolean }) {
  const m = mount(id, Game, opts)
  const base = STRATEGY[id](m)
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

  it.skipIf(['pop', 'bear', 'mole', 'num', 'abc', 'kor'].includes(id))('a wrong pick is answered and the game carries on to the finish', async () => {
    const m = await playToEnd(id, Game, { age: 3, random: rngFor(id), wrong: true })
    expect(m.says.some(t => WRONG_SAID[id].test(t))).toBe(true)
    expectOneFinish(m, id, 3)
  })

  it('StrictMode does not start the game twice', async () => {
    const m = mount(id, Game, { age: 3, random: rngFor(id), strict: true })
    await drive(m, () => null, () => m.engine.chooser.isActive(), 60_000)
    expect(m.says.filter(t => isFirstPrompt(id, t))).toHaveLength(1)
    await drive(m, STRATEGY[id](m), () => m.onFinish.mock.calls.length > 0)
    await tick(20_000)
    expectOneFinish(m, id, 3)
  })

  it('unmounting mid-game leaves no overlays, no timers and no late finish', async () => {
    const m = mount(id, Game, { age: 4, random: rngFor(id) })
    const base = STRATEGY[id](m)
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
    const answer = STRATEGY.fruit(m)
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

describe('bundle 2 endings', () => {
  it.each([['pop', Pop, '토끼를 찾았어!'], ['memory', Memory, '짝꿍을 다 찾았어!'], ['same', Same, '같은 그림을 다 찾았어!'], ['bear', Bear, '곰돌이가 사탕을 다 먹었어!']] as const)('%s finishes with its message', async (id, Game, msg) => {
    const m = await playToEnd(id, Game, { age: 4, random: rngFor(id) })
    expect(m.onFinish).toHaveBeenCalledWith(msg)
  })

  it('memory plays three rounds', async () => {
    const m = await playToEnd('memory', Memory, { age: 3, random: rngFor('memory') })
    expect(m.says.filter(t => t === '다음 판!')).toHaveLength(2)
    expect(m.says.filter(t => t.endsWith('짝꿍 찾았다!'))).toHaveLength(6)
  })

  it('same asks five questions', async () => {
    const m = await playToEnd('same', Same, { age: 3, random: rngFor('same') })
    expect(m.says.filter(t => t.startsWith('맞았어! '))).toHaveLength(5)
  })

  it('bear: every candy is eaten (one count-along per candy)', async () => {
    const m = await playToEnd('bear', Bear, { age: 5, random: rngFor('bear') })
    const rolled = m.says.filter(t => /^(하나|둘|셋|넷|다섯|여섯)!( 마지막 사탕이야!)?$/.test(t))
    expect(rolled.length).toBeGreaterThan(1)
    expect(m.says.some(t => t.startsWith('냠냠! 사탕이 '))).toBe(true)
  })
})

describe('bundle 3 endings and counts', () => {
  it.each([['size', Size, '크고 작은 걸 잘 찾았어!'], ['num', Num, '숫자를 잘 찾았어!'], ['abc', Abc, '알파벳을 잘 찾았어!'], ['kor', Kor, '한글을 잘 찾았어!'], ['mole', Mole, '두더지를 다 잡았어!']] as const)('%s finishes with its message', async (id, Game, msg) => {
    const m = await playToEnd(id, Game, { age: 4, random: rngFor(id) })
    expect(m.onFinish).toHaveBeenCalledWith(msg)
  })

  it('size asks five questions', async () => {
    const m = await playToEnd('size', Size, { age: 5, random: rngFor('size') })
    expect(m.says.filter(t => /찾아 봐!$/.test(t))).toHaveLength(5)
    expect(m.says.filter(t => t === '맞았어! 제일 커!' || t === '맞았어! 제일 작아!')).toHaveLength(5)
  })

  it('size age 3 only ever asks for the biggest', async () => {
    const m = await playToEnd('size', Size, { age: 3, random: rngFor('size') })
    expect(m.says.filter(t => /^제일 큰 .+ 찾아 봐!$/.test(t))).toHaveLength(5)
    expect(m.says.some(t => /^제일 작은/.test(t))).toBe(false)
  })

  it.each([['num', Num], ['abc', Abc], ['kor', Kor]] as const)('%s: five questions, five right answers, "n / 5" progress', async (id, Game) => {
    const m = await playToEnd(id, Game, { age: 3, random: rngFor(id) })
    expect(m.says.filter(t => /! 어디 있을까\?$/.test(t))).toHaveLength(5)
    expect(m.says.filter(t => t.startsWith('맞았어! '))).toHaveLength(5)
    expect(document.querySelector('p.muted')?.textContent).toBe('5 / 5')
  })

  it('kor hides the spoken syllable in the bubble, num shows it', async () => {
    const k = mount('kor', Kor, { age: 3, random: mulberry32(1) })
    await tick(100)
    expect(bubble()).toBe('잘 듣고 찾아 봐!')
    k.unmount()
    const n = mount('num', Num, { age: 3, random: mulberry32(1) })
    await tick(100)
    expect(bubble()).toMatch(/^.+!$/)
    expect(bubble()).not.toBe('잘 듣고 찾아 봐!')
    n.unmount()
  })

  describe.each([['num', Num], ['abc', Abc], ['kor', Kor]] as const)('%s wrong answers', (id, Game) => {
    it('a wrong pick is answered with "다시 들어 봐", hints from the second miss, and the quiz carries on', async () => {
      const m = mount(id, Game, { age: 3, random: mulberry32(2) })
      const spoken: string[] = []
      const speak = m.engine.speak
      m.engine.speak = (t, cb) => { spoken.push(t); speak(t, cb) }
      const right = STRATEGY[id](m)
      let misses = 0
      await drive(m, (items, b) => {
        const a = right(items, b)
        if (a === null || a < 0) return null
        if (misses < 2) { misses++; return a === 0 ? 1 : 0 }
        return a
      }, () => m.onFinish.mock.calls.length > 0)
      await tick(20_000)
      expect(spoken.filter(t => /^다시 들어 봐\. /.test(t))).toHaveLength(2)
      expect(m.says.filter(t => t.startsWith('맞았어! '))).toHaveLength(5)
      expectOneFinish(m, id, 3)
    })
  })

  it('quiz: staying silent hints, then reveals the answer, then asks the next one', async () => {
    const m = mount('num', Num, { age: 3, random: mulberry32(3) })
    const spoken: string[] = []
    const speak = m.engine.speak
    m.engine.speak = (t, cb) => { spoken.push(t); speak(t, cb) }
    await tick(100)
    const first = m.engine.chooser.items()
    expect(first).toHaveLength(3)
    const sound = m.says[0].replace('! 어디 있을까?', '')
    const ai = first.findIndex(e => labelOf(e) === sound)
    // control "both", scan 3, three options: hint at max(5, 9) = 9s, reveal at max(10, 18) = 18s
    await tick(8_800)
    expect(first[ai].classList.contains('hint')).toBe(false)
    await tick(400)
    expect(first[ai].classList.contains('hint')).toBe(true)
    expect(spoken).toContain(sound)
    await tick(8_600)
    expect(m.says.some(t => t.startsWith('정답은|' + sound + '! 다음 문제!'))).toBe(false)
    await tick(500)
    expect(m.says.filter(t => t.startsWith('정답은|' + sound + '! 다음 문제!'))).toHaveLength(1)
    expect(m.engine.chooser.isActive()).toBe(false)
    expect(document.querySelector('.tap.pop')?.textContent).toBe(first[ai].textContent)
    await tick(2_700)
    expect(m.says.filter(t => /! 어디 있을까\?$/.test(t))).toHaveLength(2)
    expect(m.engine.chooser.isActive()).toBe(true)
  })

  it('quiz: the speaker button repeats the question unless only space is used', async () => {
    const m = mount('num', Num, { age: 3, random: mulberry32(3) })
    const spoken: string[] = []
    const speak = m.engine.speak
    m.engine.speak = (t, cb) => { spoken.push(t); speak(t, cb) }
    await tick(100)
    const sound = m.says[0].replace('! 어디 있을까?', '')
    act(() => { document.querySelector<HTMLButtonElement>('button[aria-label="다시 듣기"]')!.click() })
    expect(spoken).toEqual([sound])
  })

  describe('mole', () => {
    const items1: Answer = items => (items.length ? 0 : null)

    it('age 4 miss: a mole nobody taps hides after four seconds and the game carries on to its end', async () => {
      const m = mount('mole', Mole, { age: 4, random: mulberry32(11) })
      const spoken: string[] = []
      const speak = m.engine.speak
      m.engine.speak = (t, cb) => { spoken.push(t); speak(t, cb) }
      let ignore = true
      // Ignore the first mole completely, tap every other one.
      await drive(m, items => (ignore || !items.length ? null : 0), () => spoken.includes('쏙 숨었다!'), 30_000)
      expect(spoken.filter(t => t === '쏙 숨었다!')).toHaveLength(1)
      expect(m.engine.chooser.isActive()).toBe(false)
      ignore = false
      await drive(m, items1, () => m.onFinish.mock.calls.length > 0)
      await tick(20_000)
      expect(m.onFinish).toHaveBeenCalledWith('두더지를 일곱 마리 잡았어!')
      expect(document.querySelectorAll('img[alt="잡은 두더지"]')).toHaveLength(7)
      expectOneFinish(m, 'mole', 4)
    })

    it('age 5 miss at every hole: eight moles hide, none caught', async () => {
      const m = mount('mole', Mole, { age: 5, random: mulberry32(12) })
      const spoken: string[] = []
      const speak = m.engine.speak
      m.engine.speak = (t, cb) => { spoken.push(t); speak(t, cb) }
      await drive(m, () => null, () => m.onFinish.mock.calls.length > 0)
      expect(spoken.filter(t => t === '쏙 숨었다!')).toHaveLength(8)
      expect(m.onFinish).toHaveBeenCalledWith('두더지가 다 숨었어! 다음엔 꼭 잡아 보자!')
      expect(document.querySelectorAll('img[alt="잡은 두더지"]')).toHaveLength(0)
      expectOneFinish(m, 'mole', 5)
    })

    it('age 3: a mole waits as long as it takes (no miss timer)', async () => {
      const m = mount('mole', Mole, { age: 3, random: mulberry32(13) })
      await tick(60_000)
      expect(m.engine.chooser.isActive()).toBe(true)
      expect(m.onFinish).not.toHaveBeenCalled()
    })

    it.each([[3, 3], [4, 4], [5, 6]] as const)('age %i has %i holes', async (age, holes) => {
      const m = mount('mole', Mole, { age, random: mulberry32(14) })
      await tick(100)
      expect(document.querySelectorAll('button[aria-label$="번 구멍"]')).toHaveLength(holes)
      m.unmount()
    })

    it('a hit shows the hurt mole, then the burst goes away again', async () => {
      const m = mount('mole', Mole, { age: 3, random: mulberry32(15) })
      await drive(m, items1, () => m.engine.chooser.isActive(), 5_000)
      act(() => { m.engine.chooser.pick(0) })
      await tick(200)
      expect(document.querySelectorAll('.burst')).toHaveLength(1)
      expect(document.querySelector('img[src$="mole_hurt.png"]')).not.toBeNull()
      await tick(1_100)
      expect(document.querySelectorAll('.burst')).toHaveLength(0)
      expect(document.querySelector('img[src$="mole_hurt.png"]')).toBeNull()
    })
  })
})
