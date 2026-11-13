import { expect, it } from 'vitest'
import { cfg, TOTAL } from './config'

// Original chickGame (index.html:315).
it('chick cfg matches the original per age', () => {
  expect(cfg).toEqual({
    3: { min: 1, max: 3, opts: 3, dots: true, countAlong: true },
    4: { min: 1, max: 5, opts: 3, dots: true, countAlong: false },
    5: { min: 1, max: 10, opts: 4, dots: false, countAlong: false },
  })
  expect(TOTAL).toBe(5)
})
