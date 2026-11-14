import { expect, it } from 'vitest'
import { cfg, COLS, ROUNDS } from './config'

// Original memoryGame (index.html:283).
it('memory cfg matches the original per age', () => {
  expect(cfg).toEqual({ 3: { pairs: 2, preview: true }, 4: { pairs: 3, preview: false }, 5: { pairs: 4, preview: false } })
  expect(COLS).toEqual({ 2: 4, 3: 3, 4: 4 })
  expect(ROUNDS).toBe(3)
})
