/** Original GANA (index.html:563): [syllable, example word]. */
export const GANA: [string, string][] = [
  ['가', '가방'], ['나', '나비'], ['다', '다리'], ['라', '라면'], ['마', '마스크'], ['바', '바나나'], ['사', '사과'],
  ['아', '아기'], ['자', '자동차'], ['차', '차'], ['카', '카메라'], ['타', '타조'], ['파', '파도'], ['하', '하마'],
]

/** Original GANA_B (index.html:564): syllables with a final consonant, age 5 only. */
export const GANA_B: [string, string][] = [
  ['각', '각도기'], ['난', '난초'], ['달', '달'], ['말', '말'], ['밤', '밤'], ['산', '산'], ['강', '강아지'], ['곰', '곰'], ['눈', '눈'], ['별', '별'],
]

export type KorCfg = { n: number; extra: boolean }

/** Original korGame: `n` options, `extra` adds GANA_B to the pool. */
export const cfg: Record<3 | 4 | 5, KorCfg> = {
  3: { n: 3, extra: false },
  4: { n: 4, extra: false },
  5: { n: 4, extra: true },
}
