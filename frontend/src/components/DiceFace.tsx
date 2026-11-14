const P: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-9, -9], [9, 9]],
  3: [[-10, -10], [0, 0], [10, 10]],
  4: [[-9, -9], [9, -9], [-9, 9], [9, 9]],
  5: [[-10, -10], [10, -10], [0, 0], [-10, 10], [10, 10]],
  6: [[-9, -11], [9, -11], [-9, 0], [9, 0], [-9, 11], [9, 11]],
}

/** Original dots(n, size): a white die face with n pips. */
export function DiceFace({ n, size }: { n: number; size: number }) {
  return (
    <svg width={size} height={size} viewBox="-25 -25 50 50" aria-hidden="true">
      <rect x="-22" y="-22" width="44" height="44" rx="9" fill="#fff" />
      {(P[n] ?? []).map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.6" fill="#2A2622" />)}
    </svg>
  )
}
