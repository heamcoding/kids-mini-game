import { expect, it } from 'vitest'
import { cfg } from './config'

// Original owlGame (index.html:334).
it('owl cfg matches the original per age', () => {
  expect(cfg).toEqual({
    3: { colors: 3, len: 6, sun: 6 },
    4: { colors: 4, len: 8, sun: 5 },
    5: { colors: 4, len: 10, sun: 5 },
  })
})
