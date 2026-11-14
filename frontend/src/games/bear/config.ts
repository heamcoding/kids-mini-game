export type BearCfg = { max: number; snacks: number }

/** Original bearGame cfg (index.html:470). */
export const cfg: Record<3 | 4 | 5, BearCfg> = {
  3: { max: 3, snacks: 8 },
  4: { max: 4, snacks: 10 },
  5: { max: 6, snacks: 12 },
}

export const CANDY = ['red', 'yellow', 'green', 'blue', 'purple', 'pink', 'orange']
