import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
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
      writeFileSync(swPath, injectPrecache(readFileSync(swPath, 'utf8'), buildPrecacheList(walk(outDir))))
    },
  }
}
