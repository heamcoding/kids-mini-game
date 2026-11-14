export type NumCfg = { min: number; max: number; opts: number; confuse: boolean }

/** Original numberGame cfg (index.html:554). `confuse` adds the digit-swapped number as a look-alike option. */
export const cfg: Record<3 | 4 | 5, NumCfg> = {
  3: { min: 1, max: 10, opts: 3, confuse: false },
  4: { min: 11, max: 99, opts: 4, confuse: false },
  5: { min: 11, max: 99, opts: 4, confuse: true },
}
