import type { ReactNode } from 'react'

export type Mark = 'dot' | 'stripe' | 'star' | 'ring'
export type Col = { id: string; c: string; name: string; mark: Mark; mname: string }

/** Original COLS (index.html:307). */
export const COLS: Col[] = [
  { id: 'red', c: '#E35D4B', name: '빨간', mark: 'dot', mname: '점무늬' },
  { id: 'yellow', c: '#E9B400', name: '노란', mark: 'stripe', mname: '줄무늬' },
  { id: 'blue', c: '#3D7CCB', name: '파란', mark: 'star', mname: '별무늬' },
  { id: 'green', c: '#4E9A5B', name: '초록', mark: 'ring', mname: '동그라미 무늬' },
]

/** Original MARKS (index.html:303). */
const MARKS: Record<Mark, ReactNode> = {
  dot: <><circle cx="-8" cy="-8" r="4" fill="#fff" /><circle cx="8" cy="-8" r="4" fill="#fff" /><circle cx="0" cy="4" r="4" fill="#fff" /><circle cx="-8" cy="12" r="4" fill="#fff" /><circle cx="8" cy="12" r="4" fill="#fff" /></>,
  stripe: <><rect x="-16" y="-12" width="32" height="5" rx="2.5" fill="#fff" /><rect x="-16" y="-1" width="32" height="5" rx="2.5" fill="#fff" /><rect x="-16" y="10" width="32" height="5" rx="2.5" fill="#fff" /></>,
  star: <path d="M0 -15 L4.5 -5 L15 -4.5 L7 3 L9.5 14 L0 8 L-9.5 14 L-7 3 L-15 -4.5 L-4.5 -5 Z" fill="#fff" />,
  ring: <circle r="11" fill="none" stroke="#fff" strokeWidth="5" />,
}

/** Original tile(col, size): a coloured rounded square with a white pattern. */
export function ColorTile({ col, size }: { col: Col; size: number | string }) {
  return (
    <svg width={size} height={size} viewBox="-25 -25 50 50" aria-hidden="true">
      <rect x="-23" y="-23" width="46" height="46" rx="9" fill={col.c} />
      <g opacity=".45">{MARKS[col.mark]}</g>
    </svg>
  )
}
