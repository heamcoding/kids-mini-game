import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { collectChars } from './collectCharset.mjs'

const root = join(__dirname, '..')

it('the self-hosted font subset covers every character the app uses', () => {
  const charset = readFileSync(join(root, 'src/fonts/charset.txt'), 'utf8')
  const missing = (collectChars(root) as string[]).filter(c => !charset.includes(c))
  expect(missing, `run scripts/build-fonts.sh to add: ${missing.join('')}`).toEqual([])
})

it('ships the subsetted woff2 files that fonts.css points to', () => {
  const css = readFileSync(join(root, 'src/fonts/fonts.css'), 'utf8')
  const urls = [...css.matchAll(/url\(([^)]+\.woff2)\)/g)].map(m => m[1])
  expect(urls.length).toBe(4)
  for (const u of urls) expect(existsSync(join(root, 'src/fonts', u)), u).toBe(true)
})

it('does not reference Google Fonts any more', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8')
  expect(html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/)
})
