import { expect, it } from 'vitest'
import { cfg } from './config'
import { makeQuestion } from './logic'

it.each([3, 4, 5] as const)('age %i questions: answer in range, distinct options include it', age => {
  const c = cfg[age]
  for (let k = 0; k < 300; k++) {
    const { n, nums } = makeQuestion(c)
    expect(n).toBeGreaterThanOrEqual(c.min)
    expect(n).toBeLessThanOrEqual(c.max)
    expect(nums).toContain(n)
    expect(new Set(nums).size).toBe(c.opts)
    for (const v of nums) { expect(v).toBeGreaterThanOrEqual(1); expect(v).toBeLessThanOrEqual(Math.max(c.max, c.opts)) }
  }
})
