export type OwlCfg = { colors: number; len: number; sun: number }

/** Original owlGame cfg (index.html:334). */
export const cfg: Record<3 | 4 | 5, OwlCfg> = {
  3: { colors: 3, len: 6, sun: 6 },
  4: { colors: 4, len: 8, sun: 5 },
  5: { colors: 4, len: 10, sun: 5 },
}

/** Chance a flipped card is the sun. */
export const SUN_P = 0.2
