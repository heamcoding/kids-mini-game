import type { QuizOpt, QuizQuestion } from '../shared/quiz'
import { random, rnd, shuffle } from '../shared/random'
import { ABC, cfg } from './config'

/** Original abcGame gen(): options never share a letter or a spoken name (G and Z are both "지"). */
export function makeQuestion(age: 3 | 4 | 5): QuizQuestion {
  const c = cfg[age]
  const pool = ABC.slice(0, c.pool)
  const a = pool[rnd(pool.length)]
  const others = shuffle(pool.filter(x => x[0] !== a[0] && x[1] !== a[1])).slice(0, c.n - 1)
  const low = c.lower && random() < 0.5
  const mk = (x: [string, string, string]): QuizOpt => ({ label: low ? x[0].toLowerCase() : x[0], sound: x[1], word: x[2] })
  const objs = [a, ...others].map(mk)
  return { ans: objs[0], opts: objs }
}
