import { expect, it } from 'vitest'
import { cfg, FRUITS } from './config'

// Original fruitGame (index.html:226) cfg table and FRUITS (index.html:117).
it('fruit cfg matches the original per age', () => {
  expect(cfg).toEqual({
    3: { kinds: ['apple', 'pear', 'plum'], per: 2, steps: 6 },
    4: { kinds: ['apple', 'pear', 'plum', 'grape'], per: 2, steps: 6 },
    5: { kinds: ['apple', 'pear', 'plum', 'grape'], per: 3, steps: 6 },
  })
})

it('FRUITS matches the original', () => {
  expect(FRUITS).toEqual({
    apple: { name: '사과', say: '빨간 사과', img: 'apple' },
    pear: { name: '배', say: '노란 배', img: 'pear' },
    plum: { name: '자두', say: '보라색 자두', img: 'plum' },
    grape: { name: '청포도', say: '초록 청포도', img: 'grapes' },
  })
})
