import { spriteUrl } from '../components/Sprite'
import { GAME_IMAGES } from './games'

const LOADED = new Set<string>()

export function preloadImgs(list: string[]): Promise<void> {
  return Promise.all(
    list.filter(n => !LOADED.has(n)).map(n => new Promise<void>(res => {
      const im = new Image()
      const ok = () => { LOADED.add(n); res() }
      im.onload = ok
      im.onerror = () => res()
      im.src = spriteUrl(n)
      if (im.complete && im.naturalWidth) ok()
    })),
  ).then(() => undefined)
}

export function preloadAll(): void {
  const all = new Set(['mongsil'])
  Object.values(GAME_IMAGES).forEach(l => l.forEach(n => all.add(n)))
  void preloadImgs([...all])
}

/**
 * Original launch(): preload a game's sprites; show the loading screen only if it takes over 250ms,
 * then keep it at least 700ms. Gives up waiting after 10s. Returns a cancel function.
 */
export function launchGame(id: string, showLoading: () => void, enter: () => void): () => void {
  let done = false
  let cancelled = false
  let shownAt = 0
  const timers: ReturnType<typeof setTimeout>[] = []
  timers.push(setTimeout(() => { if (!done) { shownAt = Date.now(); showLoading() } }, 250))
  const go = () => {
    if (done) return
    done = true
    if (shownAt) timers.push(setTimeout(() => { if (!cancelled) enter() }, Math.max(0, 700 - (Date.now() - shownAt))))
    else if (!cancelled) enter()
  }
  void preloadImgs(GAME_IMAGES[id] ?? []).then(go)
  timers.push(setTimeout(go, 10000))
  return () => { cancelled = true; done = true; timers.forEach(clearTimeout) }
}
