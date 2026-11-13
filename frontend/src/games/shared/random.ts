/** Original rnd(n): integer in [0, n). */
export const rnd = (n: number): number => Math.floor(Math.random() * n)

/** Original shuffle(a): Fisher–Yates on a copy. */
export function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
