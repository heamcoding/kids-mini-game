export type FruitKind = 'apple' | 'pear' | 'plum' | 'grape'
export type FruitCfg = { kinds: FruitKind[]; per: number; steps: number }

/** Original fruitGame cfg (index.html:226). */
export const cfg: Record<3 | 4 | 5, FruitCfg> = {
  3: { kinds: ['apple', 'pear', 'plum'], per: 2, steps: 6 },
  4: { kinds: ['apple', 'pear', 'plum', 'grape'], per: 2, steps: 6 },
  5: { kinds: ['apple', 'pear', 'plum', 'grape'], per: 3, steps: 6 },
}

/** Original FRUITS (index.html:117). */
export const FRUITS: Record<FruitKind, { name: string; say: string; img: string }> = {
  apple: { name: '사과', say: '빨간 사과', img: 'apple' },
  pear: { name: '배', say: '노란 배', img: 'pear' },
  plum: { name: '자두', say: '보라색 자두', img: 'plum' },
  grape: { name: '청포도', say: '초록 청포도', img: 'grapes' },
}

/** Chance that the die is rigged so the raven reaches the tree first. */
export const RAVEN_WINS_P = 0.35
