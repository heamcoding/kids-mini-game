import { rnd, shuffle } from '../shared/random'

/** Original question: answer key plus n-1 other keys, shuffled. */
export function makeQuestion(keys: string[], n: number): { ans: string; list: string[] } {
  const ans = keys[rnd(keys.length)]
  const others = shuffle(keys.filter(k => k !== ans)).slice(0, n - 1)
  return { ans, list: shuffle([ans, ...others]) }
}
