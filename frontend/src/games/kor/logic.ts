import type { QuizQuestion } from '../shared/quiz'
import { rnd, shuffle } from '../shared/random'
import { cfg, GANA, GANA_B } from './config'

/** Original korGame gen(). */
export function makeQuestion(age: 3 | 4 | 5): QuizQuestion {
  const c = cfg[age]
  const pool = c.extra ? GANA.concat(GANA_B) : GANA
  const a = pool[rnd(pool.length)]
  const others = shuffle(pool.filter(x => x[0] !== a[0])).slice(0, c.n - 1)
  const objs = [a, ...others].map(x => ({ label: x[0], sound: x[0], word: x[0] + ', ' + x[1] }))
  return { ans: objs[0], opts: objs }
}
