import { expect, it } from 'vitest'
import { friendKeys } from '../shared/friends'
import { setRandom } from '../shared/random'
import { mulberry32 } from '../test/harness'
import { makeQuestion } from './logic'

it('makeQuestion: n distinct options including the answer', () => {
  for (const age of [3, 4, 5] as const) {
    setRandom(mulberry32(age))
    const keys = friendKeys(age)
    const n = { 3: 3, 4: 4, 5: 6 }[age]
    for (let i = 0; i < 20; i++) {
      const { ans, list } = makeQuestion(keys, n)
      expect(list).toHaveLength(n)
      expect(new Set(list).size).toBe(n)
      expect(list).toContain(ans)
    }
  }
})
