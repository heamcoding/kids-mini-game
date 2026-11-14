import { expect, it } from 'vitest'
import { HOLES, STC, STEP, TOTALS } from './config'

// Original popGame (index.html:401-404).
it('pop config matches the original', () => {
  expect(TOTALS).toEqual({ 3: 6, 4: 9, 5: 12 })
  expect(STC).toHaveLength(4)
  expect(STC[0]).toEqual(['#F5473A', '#A8160E', '#FF8A80'])
  expect(HOLES).toEqual([[0.2415, 0.5537], [0.4994, 0.5834], [0.7542, 0.5548]])
  expect(STEP).toBe(135)
})
