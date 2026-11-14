// Every non-ASCII character the app can render, scanned from the sources (tests excluded).
// Used by build-fonts.sh to subset the fonts and by fonts.test.ts to keep the subset in sync.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SCAN_EXT = /\.(ts|tsx|css|html|json|webmanifest)$/
const SKIP = /(\.test\.|node_modules|\/dist\/)/

function walk(dir) {
  return readdirSync(dir).flatMap(n => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

export function collectChars(root) {
  const set = new Set()
  const files = [...walk(join(root, 'src')), join(root, 'index.html')]
  for (const f of files) {
    if (!SCAN_EXT.test(f) || SKIP.test(f)) continue
    for (const ch of readFileSync(f, 'utf8')) if (ch.codePointAt(0) > 0x7e) set.add(ch)
  }
  return [...set].sort()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(collectChars(process.cwd()).join(''))
}
