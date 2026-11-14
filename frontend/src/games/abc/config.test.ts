import { expect, it } from 'vitest'
import { ABC, cfg } from './config'
import { makeQuestion } from './logic'
import { setRandom } from '../shared/random'
import { mulberry32 } from '../test/harness'

// Original ABC (index.html:558) and abcGame (559).
it('abc table and per-age cfg match the original', () => {
  expect(ABC).toHaveLength(26)
  expect(ABC[0]).toEqual(['A', '에이', '에이, 애플'])
  expect(ABC[6]).toEqual(['G', '지', '지, 고릴라'])
  expect(ABC[22]).toEqual(['W', '더블유', '더블유, 워터'])
  expect(ABC[25]).toEqual(['Z', '지', '지, 지브라'])
  expect(ABC.map(x => x[0]).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  expect(cfg).toEqual({ 3: { pool: 10, n: 3, lower: false }, 4: { pool: 26, n: 4, lower: false }, 5: { pool: 26, n: 4, lower: true } })
})

it('age 3 draws only from A..J, three options', () => {
  setRandom(mulberry32(3))
  for (let i = 0; i < 60; i++) {
    const { ans, opts } = makeQuestion(3)
    expect(opts).toHaveLength(3)
    expect(opts[0]).toBe(ans)
    for (const o of opts) expect('ABCDEFGHIJ').toContain(o.label)
  }
})

it('no option shares the answer\'s sound (G and Z are both "지")', () => {
  for (const age of [4, 5] as const) {
    setRandom(mulberry32(age))
    for (let i = 0; i < 200; i++) {
      const { opts } = makeQuestion(age)
      expect(opts).toHaveLength(4)
      expect(new Set(opts.map(o => o.label.toUpperCase())).size).toBe(4)
      for (const o of opts.slice(1)) expect(o.sound).not.toBe(opts[0].sound)
    }
  }
})

it('age 4 is upper case only; age 5 mixes in lower case for the whole question', () => {
  setRandom(mulberry32(44))
  for (let i = 0; i < 40; i++) for (const o of makeQuestion(4).opts) expect(o.label).toMatch(/^[A-Z]$/)
  setRandom(mulberry32(55))
  let lowQ = 0, upQ = 0
  for (let i = 0; i < 80; i++) {
    const { opts } = makeQuestion(5)
    const lows = opts.filter(o => /^[a-z]$/.test(o.label)).length
    expect(lows === 0 || lows === 4).toBe(true)
    if (lows) lowQ++; else upQ++
  }
  expect(lowQ).toBeGreaterThan(10)
  expect(upQ).toBeGreaterThan(10)
})

it('carries the sound and the example word', () => {
  setRandom(mulberry32(8))
  const { ans } = makeQuestion(4)
  const row = ABC.find(x => x[0] === ans.label)!
  expect(ans.sound).toBe(row[1])
  expect(ans.word).toBe(row[2])
})
