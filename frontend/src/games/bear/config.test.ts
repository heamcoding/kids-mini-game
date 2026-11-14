import { expect, it } from 'vitest'
import { CANDY, cfg } from './config'

// Original bearGame (index.html:470) and CANDY (468).
it('bear cfg matches the original per age', () => {
  expect(cfg).toEqual({ 3: { max: 3, snacks: 8 }, 4: { max: 4, snacks: 10 }, 5: { max: 6, snacks: 12 } })
  expect(CANDY).toEqual(['red', 'yellow', 'green', 'blue', 'purple', 'pink', 'orange'])
})
