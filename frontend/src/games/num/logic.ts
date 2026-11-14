import { kor } from '../../engine/korean'
import type { QuizOpt, QuizQuestion } from '../shared/quiz'
import { rnd, shuffle } from '../shared/random'
import { cfg } from './config'

/** Original pickOpts(pool, n, ans, extra): the answer, the optional look-alike, then random pool items up to n. */
export function pickOpts<T>(pool: T[], n: number, ans: T, extra: T | null): T[] {
  const set: T[] = [ans]
  if (extra != null && !set.includes(extra)) set.push(extra)
  for (const p of shuffle(pool)) {
    if (set.length >= n) break
    if (!set.includes(p)) set.push(p)
  }
  return set
}

const mk = (n: number): QuizOpt => ({ label: String(n), sound: kor(n) })

/** Original numberGame gen(). */
export function makeQuestion(age: 3 | 4 | 5): QuizQuestion {
  const c = cfg[age]
  const a = c.min + rnd(c.max - c.min + 1)
  const pool: number[] = []
  for (let i = c.min; i <= c.max; i++) pool.push(i)
  let ex: number | null = null
  if (c.confuse && a % 10) {
    const r = (a % 10) * 10 + Math.floor(a / 10)
    if (r >= c.min && r <= c.max && r !== a) ex = r
  }
  const objs = pickOpts(pool, c.opts, a, ex).map(mk)
  return { ans: objs[0], opts: objs }
}
