export type MemoryCfg = { pairs: number; preview: boolean }

/** Original memoryGame cfg (index.html:283). */
export const cfg: Record<3 | 4 | 5, MemoryCfg> = {
  3: { pairs: 2, preview: true },
  4: { pairs: 3, preview: false },
  5: { pairs: 4, preview: false },
}

/** Grid columns by pair count (original `{2:4,3:3,4:4}[pairs]||4`). */
export const COLS: Record<number, number> = { 2: 4, 3: 3, 4: 4 }
export const ROUNDS = 3
