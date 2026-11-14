import { describe, expect, it } from 'vitest'
import { installMode } from './install'

const base = { standalone: false, canInstall: false, ios: false, swOk: false }

describe('installMode', () => {
  it('standalone wins', () => expect(installMode({ ...base, standalone: true, canInstall: true })).toBe('standalone'))
  it('install prompt available', () => expect(installMode({ ...base, canInstall: true })).toBe('prompt'))
  it('ios instructions', () => expect(installMode({ ...base, ios: true })).toBe('ios'))
  it('browser menu when service worker is active', () => expect(installMode({ ...base, swOk: true })).toBe('menu'))
  it('unavailable without service worker', () => expect(installMode(base)).toBe('unavailable'))
})
