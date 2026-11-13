/** Original squirrelGame `per` (index.html:374): acorns of each colour to collect. */
export const cfg: Record<3 | 4 | 5, number> = { 3: 1, 4: 2, 5: 3 }

export type Acorn = { id: string; name: string; img: string; c: string }

/** Original AC (index.html:375). */
export const AC: Acorn[] = [
  { id: 'red', name: '빨간', img: 'acorn3_red', c: '#F04A3E' },
  { id: 'yellow', name: '노란', img: 'acorn3_yellow', c: '#FFCE30' },
  { id: 'blue', name: '파란', img: 'acorn3_blue', c: '#348CF0' },
]
