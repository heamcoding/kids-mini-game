import { rnd, shuffle } from '../shared/random'
import type { ChickCfg } from './config'

/** Original question: n chicks, plus distinct wrong numbers drawn from min..max(max, opts), shuffled. */
export function makeQuestion(c: ChickCfg): { n: number; nums: number[] } {
  const n = c.min + rnd(c.max - c.min + 1)
  const set = new Set([n])
  while (set.size < c.opts) {
    const v = c.min + rnd(Math.max(c.max, c.opts) - c.min + 1)
    if (v >= 1) set.add(v)
  }
  return { n, nums: shuffle([...set]) }
}

/** Original clampSize(n): chick sprite size. */
export const chickSize = (n: number): number => (n > 6 ? 70 : n > 3 ? 90 : 110)
