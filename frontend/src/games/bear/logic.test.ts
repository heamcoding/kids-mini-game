import { expect, it } from 'vitest'
import { dieTop, leftDet, plateItems } from './logic'

it('plateItems cycles colours', () => {
  const p = plateItems(9)
  expect(p).toHaveLength(9)
  expect(p[7]).toBe('red')
  expect(p[8]).toBe('yellow')
})
it('dieTop never exceeds candies left', () => { expect(dieTop(6, 2)).toBe(2); expect(dieTop(3, 8)).toBe(3) })
it('leftDet', () => { expect(leftDet(8)).toBe('여덟'); expect(leftDet(10)).toBe('열'); expect(leftDet(12)).toBe('열두') })
