export type MoleCfg = { holes: number; stay: number; cols: number }

/** Original moleGame cfg (index.html:492). `stay` is how many seconds a mole waits above ground (0 = until tapped). */
export const cfg: Record<3 | 4 | 5, MoleCfg> = {
  3: { holes: 3, stay: 0, cols: 3 },
  4: { holes: 4, stay: 4, cols: 2 },
  5: { holes: 6, stay: 3, cols: 3 },
}

/** Number of moles shown per game. */
export const TOTAL = 8
