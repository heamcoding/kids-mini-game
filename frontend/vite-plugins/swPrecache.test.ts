import { describe, expect, it } from 'vitest'
import { buildPrecacheList, cacheName, injectCacheName, injectPrecache } from './swPrecache'

describe('buildPrecacheList', () => {
  it('starts with ./ , excludes sw.js and maps, sorts, dedupes', () => {
    const l = buildPrecacheList(['sw.js', 'assets/b-1.js', 'index.html', 'assets/a-2.css', 'assets/b-1.js.map', 'icons/x.png', 'index.html'])
    expect(l).toEqual(['./', 'assets/a-2.css', 'assets/b-1.js', 'icons/x.png', 'index.html'])
  })
  it('normalizes backslashes', () => {
    expect(buildPrecacheList(['assets\\a.js'])).toContain('assets/a.js')
  })
})

describe('injectPrecache', () => {
  const src = "const A=1;\nconst FILES=/*PRECACHE*/['./']/*END*/;\nconst B=2;"
  it('replaces the marked list', () => {
    const out = injectPrecache(src, ['./', 'a.js'])
    expect(out).toContain('const FILES=/*PRECACHE*/["./","a.js"]/*END*/;')
    expect(out).toContain('const B=2;')
  })
  it('throws if markers are missing', () => {
    expect(() => injectPrecache('nothing', ['./'])).toThrow()
  })
})

describe('cacheName', () => {
  it('is stable for the same contents and changes when any file changes', () => {
    const a = cacheName([['a.js', 'x'], ['b.png', 'y']])
    expect(cacheName([['a.js', 'x'], ['b.png', 'y']])).toBe(a)
    expect(cacheName([['a.js', 'x'], ['b.png', 'z']])).not.toBe(a)
    expect(cacheName([['a.js', 'x'], ['c.png', 'y']])).not.toBe(a)
    expect(a).toMatch(/^mongsil-[0-9a-f]{10}$/)
  })
})

describe('injectCacheName', () => {
  it('replaces the CACHE constant', () => {
    expect(injectCacheName("const CACHE='mongsil-v3';\nx", 'mongsil-abc')).toBe("const CACHE='mongsil-abc';\nx")
  })
  it('throws if the constant is missing', () => {
    expect(() => injectCacheName('nothing', 'n')).toThrow()
  })
})
