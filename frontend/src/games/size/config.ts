export type SizeCfg = { n: 3 | 4; small: boolean }

/** Original sizeGame cfg (index.html:521). `small` allows "제일 작은" questions. */
export const cfg: Record<3 | 4 | 5, SizeCfg> = {
  3: { n: 3, small: false },
  4: { n: 3, small: true },
  5: { n: 4, small: true },
}

/** Picture sizes shown for 3 or 4 options. */
export const SIZES: Record<3 | 4, number[]> = { 3: [60, 100, 150], 4: [50, 80, 115, 150] }

export const TOTAL = 5
