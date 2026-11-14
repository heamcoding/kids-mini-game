import { expect, it } from 'vitest'
import { cfg } from './config'
import { makeQuestion, pickOpts } from './logic'
import { setRandom } from '../shared/random'
import { mulberry32 } from '../test/harness'

// Original numberGame (index.html:554).
it('num cfg matches the original per age', () => {
  expect(cfg).toEqual({
    3: { min: 1, max: 10, opts: 3, confuse: false },
    4: { min: 11, max: 99, opts: 4, confuse: false },
    5: { min: 11, max: 99, opts: 4, confuse: true },
  })
})

it('pickOpts: answer first, then the extra, then pool items without duplicates', () => {
  setRandom(mulberry32(1))
  const pool = [1, 2, 3, 4, 5]
  expect(pickOpts(pool, 3, 2, null)).toHaveLength(3)
  const r = pickOpts(pool, 3, 2, 5)
  expect(r.slice(0, 2)).toEqual([2, 5])
  expect(r).toHaveLength(3)
  expect(new Set(r).size).toBe(3)
  expect(pickOpts(pool, 3, 2, 2)[0]).toBe(2) // extra equal to the answer is not added twice
  expect(new Set(pickOpts(pool, 3, 2, 2)).size).toBe(3)
})

it('age 3: three options from 1..10 with the Korean sound, answer first', () => {
  setRandom(mulberry32(3))
  for (let i = 0; i < 30; i++) {
    const { ans, opts } = makeQuestion(3)
    expect(opts).toHaveLength(3)
    expect(opts[0]).toBe(ans)
    expect(new Set(opts.map(o => o.label)).size).toBe(3)
    for (const o of opts) { const n = Number(o.label); expect(n >= 1 && n <= 10).toBe(true) }
  }
  expect(makeQuestion.length).toBe(1)
})

it('sounds are native Korean numerals read as Sino-Korean (kor())', () => {
  setRandom(mulberry32(9))
  const SOUND: Record<string, string> = { '1': '일', '10': '십', '11': '십일', '20': '이십', '35': '삼십오' }
  for (let i = 0; i < 40; i++) for (const o of makeQuestion(4).opts) if (SOUND[o.label]) expect(o.sound).toBe(SOUND[o.label])
})

it('age 4: four distinct options from 11..99, no confusion option forced', () => {
  setRandom(mulberry32(4))
  for (let i = 0; i < 30; i++) {
    const { ans, opts } = makeQuestion(4)
    expect(opts).toHaveLength(4)
    expect(opts[0]).toBe(ans)
    expect(new Set(opts.map(o => o.label)).size).toBe(4)
    for (const o of opts) { const n = Number(o.label); expect(n >= 11 && n <= 99).toBe(true) }
  }
})

it('age 5: the digit-swapped number is always among the options when valid', () => {
  setRandom(mulberry32(5))
  let swaps = 0
  for (let i = 0; i < 100; i++) {
    const { ans, opts } = makeQuestion(5)
    const a = Number(ans.label)
    expect(opts).toHaveLength(4)
    expect(new Set(opts.map(o => o.label)).size).toBe(4)
    const r = (a % 10) * 10 + Math.floor(a / 10)
    if (a % 10 && r >= 11 && r <= 99 && r !== a) { swaps++; expect(opts[1].label).toBe(String(r)) }
  }
  expect(swaps).toBeGreaterThan(50)
})
