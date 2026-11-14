import { rnd } from '../shared/random'

export type Filled = (number | null)[][]

export const makeFilled = (faces: number): Filled => Array.from({ length: faces }, () => [null, null, null])

/** Hole index (face*3+hole) holding the surprise. */
export const pickBoom = (total: number): number => rnd(total)

export const emptyHoles = (filled: Filled, face: number): number[] => [0, 1, 2].filter(i => filled[face][i] == null)

export const hasEmptyElsewhere = (filled: Filled, face: number): boolean => filled.some((f, i) => i !== face && f.some(v => v == null))

/** Next face (cycling) that still has an empty hole. Requires hasEmptyElsewhere. */
export function nextFace(filled: Filled, face: number): number {
  const faces = filled.length
  let nf = face
  do { nf = (nf + 1) % faces } while (!filled[nf].some(v => v == null))
  return nf
}

export type Geom = { W: number; H: number; D: number }
export type PopAnim = { f: number; j: number; col: number; p: number }
export type View = { face: number; filled: Filled; phi: number; nextF: number | null; anim: PopAnim | null }
export type HoleBox = { key: string; left: number; top: number; width: number; height: number; opacity: number }
export type StickBox =
  | { key: string; kind: 'end'; col: number; left: number; top: number; width: number; height: number; opacity: number }
  | { key: string; kind: 'side'; col: number; left: number; top: number; width: number; height: number; opacity: number; rot: number }

const X0F = 0.4979, RF = 0.3625, Y0F = 0.4839, KYF = 0.0995

/** Original popGame render(phi,nextF): where the visible holes and sticks of the turning barrel sit. */
export function scene(v: View, g: Geom, step: number): { holes: HoleBox[]; sticks: StickBox[] } {
  const { W, H, D } = g
  const X0 = X0F * W, R = RF * W, Y0 = Y0F * H, KY = KYF * H
  const L = W * 0.5, T = D * 0.78
  const holes: HoleBox[] = []
  const sticks: StickBox[] = []
  const list: [number, number][] = [[v.face, 0]]
  if (v.nextF != null) list.push([v.nextF, step])
  list.forEach(([f, off]) => {
    for (let j = 0; j < 3; j++) {
      const ang = ((j - 1) * 45 + off - v.phi) * Math.PI / 180
      const c = Math.cos(ang), sn = Math.sin(ang)
      if (c < 0.06) continue
      const cx = X0 + R * sn, cy = Y0 + KY * c, w = D * c, op = Math.min(1, c * 2.2)
      holes.push({ key: `${f}-${j}`, left: cx - w / 2, top: cy - D / 2, width: w, height: D, opacity: op })
      const col = v.filled[f][j]
      let ins = 1
      if (v.anim && v.anim.f === f && v.anim.j === j) ins = v.anim.p
      else if (col == null) continue
      const stick = col != null ? col : v.anim!.col
      const grow = 1 + (1 - ins) * 0.8
      if (Math.abs(sn) < 0.35) {
        const ww = D * 0.62 * c * grow, hh = D * 0.98 * grow
        sticks.push({ key: `${f}-${j}`, kind: 'end', col: stick, left: cx - ww / 2, top: cy - hh * 0.5, width: ww, height: hh, opacity: op })
      } else {
        const dir = sn < 0 ? -1 : 1
        const Lp = Math.max(D, L * Math.abs(sn)) * grow
        sticks.push({ key: `${f}-${j}`, kind: 'side', col: stick, left: cx + dir * Lp * 0.42 - T / 2, top: cy - Lp / 2, width: T, height: Lp, opacity: op, rot: dir * 96 })
      }
    }
  })
  return { holes, sticks }
}

/** Original easeInOutQuad used by tween(). */
export const ease = (p: number): number => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
