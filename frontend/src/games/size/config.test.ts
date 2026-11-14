import { expect, it } from 'vitest'
import { cfg, SIZES, TOTAL } from './config'
import { makeQuestion } from './logic'
import { setRandom } from '../shared/random'
import { friendKeys } from '../shared/friends'
import { mulberry32 } from '../test/harness'

// Original sizeGame (index.html:521).
it('size cfg matches the original per age', () => {
  expect(cfg).toEqual({ 3: { n: 3, small: false }, 4: { n: 3, small: true }, 5: { n: 4, small: true } })
  expect(SIZES).toEqual({ 3: [60, 100, 150], 4: [50, 80, 115, 150] })
  expect(TOTAL).toBe(5)
})

it('age 3 only ever asks for the biggest; all sizes are shown, shuffled', () => {
  setRandom(mulberry32(3))
  for (let i = 0; i < 30; i++) {
    const q = makeQuestion(friendKeys(3), 3)
    expect(q.wantSmall).toBe(false)
    expect(q.target).toBe(150)
    expect([...q.order].sort((a, b) => a - b)).toEqual([60, 100, 150])
    expect(friendKeys(3)).toContain(q.key)
  }
})

it('ages 4/5 ask for the smallest or the biggest', () => {
  setRandom(mulberry32(5))
  const seen = new Set<boolean>()
  for (let i = 0; i < 60; i++) {
    const q = makeQuestion(friendKeys(5), 5)
    seen.add(q.wantSmall)
    expect(q.target).toBe(q.wantSmall ? 50 : 150)
    expect([...q.order].sort((a, b) => a - b)).toEqual([50, 80, 115, 150])
  }
  expect(seen.size).toBe(2)
})
