/** Original ABC (index.html:558): [letter, spoken name, "name, example word"]. */
export const ABC: [string, string, string][] = [
  ['A', '에이', '에이, 애플'], ['B', '비', '비, 바나나'], ['C', '씨', '씨, 캣'], ['D', '디', '디, 독'], ['E', '이', '이, 에그'],
  ['F', '에프', '에프, 피시'], ['G', '지', '지, 고릴라'], ['H', '에이치', '에이치, 햇'], ['I', '아이', '아이, 아이스크림'], ['J', '제이', '제이, 주스'],
  ['K', '케이', '케이, 키'], ['L', '엘', '엘, 라이언'], ['M', '엠', '엠, 문'], ['N', '엔', '엔, 노즈'], ['O', '오', '오, 오렌지'],
  ['P', '피', '피, 피그'], ['Q', '큐', '큐, 퀸'], ['R', '알', '알, 래빗'], ['S', '에스', '에스, 선'], ['T', '티', '티, 트리'],
  ['U', '유', '유, 엄브렐라'], ['V', '브이', '브이, 바이올린'], ['W', '더블유', '더블유, 워터'], ['X', '엑스', '엑스, 폭스'], ['Y', '와이', '와이, 요요'],
  ['Z', '지', '지, 지브라'],
]

export type AbcCfg = { pool: number; n: number; lower: boolean }

/** Original abcGame: pool = first `pool` letters, `n` options, `lower` mixes in lower-case questions. */
export const cfg: Record<3 | 4 | 5, AbcCfg> = {
  3: { pool: 10, n: 3, lower: false },
  4: { pool: 26, n: 4, lower: false },
  5: { pool: 26, n: 4, lower: true },
}
