export type Friend = { name: string; img: string }

/** Original FRIENDS (index.html:116). */
export const FRIENDS: Record<string, Friend> = {
  rabbit: { name: '토끼', img: 'bigrabbit' },
  chick: { name: '병아리', img: 'chick1' },
  bear: { name: '곰', img: 'f_bear' },
  circle: { name: '빨간 동그라미', img: 'f_circle' },
  tri: { name: '노란 세모', img: 'f_tri' },
  square: { name: '파란 네모', img: 'f_square' },
  diamond: { name: '초록 마름모', img: 'f_diamond' },
}

/** Original friendKeys(): the diamond only appears from age 4. */
export const friendKeys = (age: 3 | 4 | 5): string[] => Object.keys(FRIENDS).filter(k => k !== 'diamond' || age > 3)
