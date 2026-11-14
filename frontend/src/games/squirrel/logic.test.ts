import { expect, it } from 'vitest'
import { spinAngle } from './logic'

it('needle lands on the middle of sector r after at least two full turns', () => {
  for (const start of [0, 45, 300, 1000]) for (const r of [0, 1, 2]) {
    const a = spinAngle(start, r)
    expect(((a % 360) + 360) % 360).toBe(r * 120 + 60)
    expect(a - start).toBeGreaterThanOrEqual(720)
    expect(a - start).toBeLessThan(1080)
  }
})
