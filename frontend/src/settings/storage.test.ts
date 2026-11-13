import { beforeEach, describe, expect, it } from 'vitest'
import { BASE } from './defaults'
import { clampSettings, loadLocal, saveLocal } from './storage'

beforeEach(() => localStorage.clear())

describe('storage', () => {
  it('returns BASE for broken JSON', () => {
    localStorage.setItem('mongsil-settings', '{oops')
    expect(loadLocal()).toEqual(BASE)
  })
  it('returns BASE when nothing stored', () => {
    expect(loadLocal()).toEqual(BASE)
  })
  it('fills missing keys with BASE', () => {
    localStorage.setItem('mongsil-settings', JSON.stringify({ rounds: 8 }))
    expect(loadLocal()).toEqual({ ...BASE, rounds: 8 })
  })
  it('clamps out-of-range values', () => {
    const s = clampSettings({ rounds: 0, voiceVol: 500, age: 9 as never })
    expect(s.rounds).toBe(1)
    expect(s.voiceVol).toBe(100)
    expect(s.age).toBeNull()
  })
  it('clamps every range', () => {
    const s = clampSettings({ scan: 99, touchTime: 0, fxVol: -1, rate: 9, pitch: 0, gap: 5, control: 'x' as never })
    expect(s).toMatchObject({ scan: 5, touchTime: 5, fxVol: 0, rate: 1.3, pitch: 0.6, gap: 2, control: 'both' })
  })
  it('round-trips via saveLocal', () => {
    saveLocal({ ...BASE, rounds: 3 })
    expect(loadLocal().rounds).toBe(3)
  })
  it('swallows storage errors', () => {
    const orig = Storage.prototype.setItem
    Storage.prototype.setItem = () => { throw new Error('full') }
    try { expect(() => saveLocal(BASE)).not.toThrow() } finally { Storage.prototype.setItem = orig }
  })
})
