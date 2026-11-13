import type { Settings } from '../settings/types'
import { getAudio } from './audio'

type Cur = {
  els: HTMLElement[]
  idx: number
  timer: ReturnType<typeof setTimeout> | null
  active: boolean
  pick: (i: number) => void
}

export type Chooser = {
  choose(els: (HTMLElement | null | undefined)[], onPick: (i: number, el: HTMLElement) => void): void
  stop(): void
  space(): void
  isActive(): boolean
}

export function createChooser(opts: { getSettings: () => Settings; isBlocked?: () => boolean; onTap?: () => void }): Chooser {
  let cur: Cur | null = null
  const blocked = () => !!opts.isBlocked?.()
  const touchOn = () => opts.getSettings().control !== 'space'
  const spaceOn = () => opts.getSettings().control !== 'touch'

  function stop() {
    if (cur) {
      if (cur.timer) clearTimeout(cur.timer)
      cur.active = false
      cur.els.forEach(e => e.classList.remove('scan'))
    }
    cur = null
  }

  function choose(input: (HTMLElement | null | undefined)[], onPick: (i: number, el: HTMLElement) => void) {
    stop()
    const els = input.filter(Boolean) as HTMLElement[]
    const c: Cur = { els, idx: -1, timer: null, active: true, pick: () => {} }
    els.forEach(e => e.classList.remove('picked'))
    els.forEach((el, i) => {
      el.onclick = () => {
        if (!c.active || blocked() || !touchOn()) return
        getAudio()
        c.pick(i)
      }
    })
    c.pick = i => {
      if (!c.active) return
      c.active = false
      if (c.timer) clearTimeout(c.timer)
      els.forEach(e => e.classList.remove('scan'))
      els[i].classList.add('picked')
      opts.onTap?.()
      onPick(i, els[i])
    }
    const step = () => {
      if (!c.active) return
      els.forEach(e => e.classList.remove('scan'))
      if (els.length === 1) { c.idx = 0; els[0].classList.add('scan'); return }
      c.idx = (c.idx + 1) % els.length
      els[c.idx].classList.add('scan')
      c.timer = setTimeout(step, opts.getSettings().scan * 1000)
    }
    if (spaceOn()) step()
    cur = c
  }

  function space() {
    if (blocked()) return
    getAudio()
    if (cur && cur.active && spaceOn() && cur.idx >= 0) cur.pick(cur.idx)
  }

  return { choose, stop, space, isActive: () => !!cur?.active }
}

export function attachSpaceKey(chooser: Chooser, target: Document = document): () => void {
  const h = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault()
      chooser.space()
    }
  }
  target.addEventListener('keydown', h, true)
  return () => target.removeEventListener('keydown', h, true)
}
