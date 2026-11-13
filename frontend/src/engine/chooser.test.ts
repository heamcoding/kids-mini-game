import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BASE } from '../settings/defaults'
import type { Settings } from '../settings/types'
import { createChooser } from './chooser'

const mk = () => [0, 1, 2].map(() => document.createElement('button'))
let S: Settings
beforeEach(() => { vi.useFakeTimers(); S = { ...BASE } })
afterEach(() => vi.useRealTimers())

describe('chooser', () => {
  it('scans and picks with space', () => {
    const els = mk(); const onPick = vi.fn()
    const ch = createChooser({ getSettings: () => S })
    ch.choose(els, onPick)
    expect(els[0].classList.contains('scan')).toBe(true)
    vi.advanceTimersByTime(3000)
    expect(els[1].classList.contains('scan')).toBe(true)
    expect(els[0].classList.contains('scan')).toBe(false)
    ch.space()
    expect(onPick).toHaveBeenCalledWith(1, els[1])
    expect(els[1].classList.contains('picked')).toBe(true)
  })
  it('control=space ignores click', () => {
    S.control = 'space'
    const els = mk(); const onPick = vi.fn()
    createChooser({ getSettings: () => S }).choose(els, onPick)
    els[0].click(); expect(onPick).not.toHaveBeenCalled()
  })
  it('control=touch has no scan timer and ignores space', () => {
    S.control = 'touch'
    const els = mk(); const onPick = vi.fn()
    const ch = createChooser({ getSettings: () => S })
    ch.choose(els, onPick)
    expect(els.some(e => e.classList.contains('scan'))).toBe(false)
    vi.advanceTimersByTime(10000)
    expect(els.some(e => e.classList.contains('scan'))).toBe(false)
    ch.space(); expect(onPick).not.toHaveBeenCalled()
    els[2].click(); expect(onPick).toHaveBeenCalledWith(2, els[2])
  })
  it('blocked ignores click and space', () => {
    const els = mk(); const onPick = vi.fn()
    const ch = createChooser({ getSettings: () => S, isBlocked: () => true })
    ch.choose(els, onPick); els[0].click(); ch.space()
    expect(onPick).not.toHaveBeenCalled()
  })
  it('single element stays highlighted without timer', () => {
    const els = mk().slice(0, 1)
    createChooser({ getSettings: () => S }).choose(els, () => {})
    expect(els[0].classList.contains('scan')).toBe(true)
    expect(vi.getTimerCount()).toBe(0)
  })
  it('stop clears scan', () => {
    const els = mk(); const ch = createChooser({ getSettings: () => S })
    ch.choose(els, () => {}); ch.stop()
    expect(els.some(e => e.classList.contains('scan'))).toBe(false)
    expect(vi.getTimerCount()).toBe(0)
  })
})
