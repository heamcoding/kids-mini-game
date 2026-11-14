import { describe, expect, it } from 'vitest'
import { buildPrecacheList, injectPrecache } from './swPrecache'

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
