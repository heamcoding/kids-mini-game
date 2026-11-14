import { expect, it } from 'vitest'
import { cfg, TOTAL } from './config'

// Original sameGame (index.html:451).
it('same cfg matches the original per age', () => {
  expect(cfg).toEqual({ 3: 3, 4: 4, 5: 6 })
  expect(TOTAL).toBe(5)
})
