import { expect, it } from 'vitest'
import { friendKeys } from '../shared/friends'
import { mulberry32 } from '../test/harness'
import { setRandom } from '../shared/random'
import { isMatch, makeDeck } from './logic'

it('makeDeck: each chosen kind appears exactly twice', () => {
  setRandom(mulberry32(3))
  const d = makeDeck(friendKeys(5), 4)
  expect(d).toHaveLength(8)
  const counts = new Map<string, number>()
  d.forEach(k => counts.set(k, (counts.get(k) ?? 0) + 1))
  expect(counts.size).toBe(4)
  expect([...counts.values()].every(n => n === 2)).toBe(true)
})

it('friendKeys: diamond only from age 4', () => {
  expect(friendKeys(3)).not.toContain('diamond')
  expect(friendKeys(4)).toContain('diamond')
})

it('isMatch compares kinds', () => { expect(isMatch('a', 'a')).toBe(true); expect(isMatch('a', 'b')).toBe(false) })
