import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import type { Engine } from '../../engine'
import type { GameProps } from '../../shell/games'

export type GameCtx = {
  engine: Engine
  age: 3 | 4 | 5
  say: Engine['say']
  later: Engine['later']
  /** Apply state updates and commit them to the DOM now, so refs are current (original innerHTML was synchronous). */
  commit(fn: () => void): void
  /** Plain timer (original bare setTimeout) that is dropped once the game unmounts. */
  timeout(fn: () => void, ms: number): void
  /** Append a floating element to <body> (original `data-ov` nodes); removed when the game unmounts. */
  overlay<T extends HTMLElement>(el: T): T
  finish(msg?: string): void
  alive(): boolean
}

/**
 * Runs an imperative game script once the game's first render is on screen, like the original
 * `xxxGame()` functions that built the screen and then started their callback chain.
 */
export function useGame(props: GameProps, run: (g: GameCtx) => void): void {
  const latest = useRef(props)
  latest.current = props
  const runRef = useRef(run)
  runRef.current = run

  useEffect(() => {
    let alive = true
    const ovs = new Set<HTMLElement>()
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const { engine, settings } = latest.current
    const g: GameCtx = {
      engine,
      age: settings.age || 3,
      say: (...a) => engine.say(...a),
      later: (fn, ms) => engine.later(() => { if (alive) fn() }, ms),
      commit: fn => { if (alive) flushSync(fn) },
      timeout(fn, ms) {
        const t = setTimeout(() => { timers.delete(t); if (alive) fn() }, ms)
        timers.add(t)
      },
      overlay(el) {
        el.dataset.ov = '1'
        document.body.appendChild(el)
        ovs.add(el)
        return el
      },
      finish: msg => { if (alive) latest.current.onFinish(msg) },
      alive: () => alive,
    }
    // A microtask: after React's effect flush (flushSync is not allowed inside it), before any timer.
    queueMicrotask(() => { if (alive) runRef.current(g) })
    return () => {
      alive = false
      timers.forEach(clearTimeout)
      ovs.forEach(e => e.remove())
    }
  }, [])
}
