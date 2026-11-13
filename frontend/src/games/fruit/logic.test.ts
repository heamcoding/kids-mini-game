import { expect, it } from 'vitest'
import { makePlan, nextFace } from './logic'

const count = (p: string[], c: string) => p.filter(x => x === c).length

it('raven-wins plan: steps ravens, last face raven, 1..F-1 fruit faces', () => {
  for (let k = 0; k < 200; k++) {
    const p = makePlan(6, 6, true)
    expect(count(p, 'R')).toBe(6)
    expect(p[p.length - 1]).toBe('R')
    expect(count(p, 'F')).toBeGreaterThanOrEqual(3)
    expect(count(p, 'F')).toBeLessThanOrEqual(5)
  }
  expect(count(makePlan(1, 6, true), 'F')).toBe(1)
})

it('kid-wins plan: exactly F fruit faces, under steps ravens, last face fruit', () => {
  for (let k = 0; k < 200; k++) {
    const p = makePlan(12, 6, false)
    expect(count(p, 'F')).toBe(12)
    expect(count(p, 'R')).toBeLessThan(6)
    expect(p[p.length - 1]).toBe('F')
  }
})

it('nextFace follows the plan and falls back to raven when nothing is left', () => {
  expect(nextFace(['F'], ['pear'])).toBe('pear')
  expect(nextFace(['R'], ['pear'])).toBe('raven')
  expect(nextFace(['F'], [])).toBe('raven')
  expect(nextFace([], ['apple'])).toBe('apple')
})
