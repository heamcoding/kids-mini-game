import { expect, it } from 'vitest'
import { setRandom } from '../shared/random'
import { emptyHoles, hasEmptyElsewhere, makeFilled, nextFace, pickBoom } from './logic'

it('pickBoom is within [0,total)', () => {
  setRandom(() => 0.999)
  expect(pickBoom(6)).toBe(5)
  setRandom(() => 0)
  expect(pickBoom(12)).toBe(0)
})
it('empty holes / next face skip full faces', () => {
  const f = makeFilled(3)
  f[1] = [0, 1, 2]
  expect(emptyHoles(f, 1)).toEqual([])
  expect(emptyHoles(f, 0)).toEqual([0, 1, 2])
  expect(nextFace(f, 0)).toBe(2)
  expect(nextFace(f, 2)).toBe(0)
  f[0] = [0, 1, 2]
  expect(hasEmptyElsewhere(f, 2)).toBe(false)
  expect(hasEmptyElsewhere(f, 0)).toBe(true)
})

import { ease, scene, type View } from './logic'
import { STEP } from './config'

it('ease is 0, .5 and 1 at the ends and middle', () => { expect(ease(0)).toBe(0); expect(ease(0.5)).toBe(0.5); expect(ease(1)).toBe(1) })

it('scene: at rest only the 3 holes of the face are visible; a filled centre hole shows an end-on stick', () => {
  const filled = makeFilled(2)
  filled[0][1] = 2
  const v: View = { face: 0, filled, phi: 0, nextF: null, anim: null }
  const s = scene(v, { W: 400, H: 375, D: 71.2 }, STEP)
  expect(s.holes).toHaveLength(3)
  expect(s.sticks).toHaveLength(1)
  expect(s.sticks[0]).toMatchObject({ kind: 'end', col: 2 })
  const mid = scene({ ...v, phi: 60, nextF: 1 }, { W: 400, H: 375, D: 71.2 }, STEP)
  expect(mid.holes.length).toBeGreaterThan(0)
})
