import { random, rnd, shuffle } from '../shared/random'
import { cfg, SIZES } from './config'

export type SizeQuestion = { key: string; order: number[]; wantSmall: boolean; target: number }

/** Original sizeGame next(): draw order is key, shuffle, small-or-big. */
export function makeQuestion(keys: string[], age: 3 | 4 | 5): SizeQuestion {
  const c = cfg[age]
  const key = keys[rnd(keys.length)]
  const sizes = SIZES[c.n]
  const order = shuffle(sizes)
  const wantSmall = c.small && random() < 0.5
  return { key, order, wantSmall, target: wantSmall ? Math.min(...sizes) : Math.max(...sizes) }
}
