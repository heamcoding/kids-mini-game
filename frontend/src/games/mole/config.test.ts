import { expect, it } from 'vitest'
import { cfg, TOTAL } from './config'
import { finishMessage, pickHole } from './logic'
import { setRandom } from '../shared/random'
import { mulberry32 } from '../test/harness'

// Original moleGame (index.html:492).
it('mole cfg matches the original per age', () => {
  expect(cfg).toEqual({
    3: { holes: 3, stay: 0, cols: 3 },
    4: { holes: 4, stay: 4, cols: 2 },
    5: { holes: 6, stay: 3, cols: 3 },
  })
  expect(TOTAL).toBe(8)
})

it('pickHole never repeats the last hole', () => {
  setRandom(mulberry32(7))
  let last = -1
  for (let i = 0; i < 200; i++) {
    const h = pickHole(last, 3)
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(3)
    expect(h).not.toBe(last)
    last = h
  }
})

it('finishMessage by number caught', () => {
  expect(finishMessage(8, 8)).toBe('두더지를 다 잡았어!')
  expect(finishMessage(0, 8)).toBe('두더지가 다 숨었어! 다음엔 꼭 잡아 보자!')
  expect(finishMessage(1, 8)).toBe('두더지를 한 마리 잡았어!')
  expect(finishMessage(2, 8)).toBe('두더지를 두 마리 잡았어!')
  expect(finishMessage(7, 8)).toBe('두더지를 일곱 마리 잡았어!')
})
