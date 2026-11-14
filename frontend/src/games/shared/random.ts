let source: () => number = Math.random

/** Swap the random source (tests make games deterministic with a seeded PRNG). */
export function setRandom(fn: () => number): void { source = fn }

/** All game randomness goes through here (original Math.random()). */
export const random = (): number => source()

/** Original rnd(n): integer in [0, n). */
export const rnd = (n: number): number => Math.floor(random() * n)

/** Original shuffle(a): Fisher–Yates on a copy. */
export function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
