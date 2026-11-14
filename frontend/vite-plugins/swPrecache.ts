import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/** Build the precache URL list (relative to the SW scope) from dist file paths. */
export function buildPrecacheList(files: string[]): string[] {
  const set = new Set(
    files.map(f => f.replace(/\\/g, '/')).filter(f => f !== 'sw.js' && !f.endsWith('.map')),
  )
  return ['./', ...[...set].sort()]
}

/** Replace the list between the PRECACHE/END markers in sw.js source. */
export function injectPrecache(src: string, list: string[]): string {
  const re = /\/\*PRECACHE\*\/[\s\S]*?\/\*END\*\//
  if (!re.test(src)) throw new Error('sw.js: PRECACHE markers not found')
  return src.replace(re, () => `/*PRECACHE*/${JSON.stringify(list)}/*END*/`)
}

/** Cache name derived from every emitted file's path and bytes, so any asset change ships a new cache. */
export function cacheName(entries: [string, string | Buffer][]): string {
  const h = createHash('sha256')
  for (const [path, body] of [...entries].sort(([a], [b]) => (a < b ? -1 : 1))) h.update(path).update('\0').update(body).update('\0')
  return `mongsil-${h.digest('hex').slice(0, 10)}`
}

/** Replace the CACHE constant in sw.js source. */
export function injectCacheName(src: string, name: string): string {
  const re = /const CACHE='[^']*'/
  if (!re.test(src)) throw new Error('sw.js: CACHE constant not found')
  return src.replace(re, () => `const CACHE='${name}'`)
}

function walk(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p, base) : [p.slice(base.length + 1)]
  })
}

/** After the build, write the real list of emitted files (hashed bundles included) into dist/sw.js. */
export function swPrecache(): Plugin {
  let outDir = 'dist'
  return {
    name: 'sw-precache',
    apply: 'build',
    configResolved(c) { outDir = join(c.root, c.build.outDir) },
    closeBundle() {
      const swPath = join(outDir, 'sw.js')
      const files = walk(outDir)
      const list = buildPrecacheList(files)
      const name = cacheName(list.filter(f => f !== './').map(f => [f, readFileSync(join(outDir, f))]))
      writeFileSync(swPath, injectCacheName(injectPrecache(readFileSync(swPath, 'utf8'), list), name))
    },
  }
}
