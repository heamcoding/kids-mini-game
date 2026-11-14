export type ChickCfg = { min: number; max: number; opts: number; dots: boolean; countAlong: boolean }

/** Original chickGame cfg (index.html:315). */
export const cfg: Record<3 | 4 | 5, ChickCfg> = {
  3: { min: 1, max: 3, opts: 3, dots: true, countAlong: true },
  4: { min: 1, max: 5, opts: 3, dots: true, countAlong: false },
  5: { min: 1, max: 10, opts: 4, dots: false, countAlong: false },
}

/** Questions per game. */
export const TOTAL = 5
