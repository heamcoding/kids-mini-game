import { useLayoutEffect, useSyncExternalStore, type MouseEvent, type ReactNode } from 'react'
import { useEngine } from '../engine/context'
import { Mongsil } from './Mongsil'

function Guide() {
  const engine = useEngine()
  const text = useSyncExternalStore(engine.subscribeBubble, engine.getBubble)
  return (
    <div id="guide">
      <div id="mongsil"><Mongsil size={130} /></div>
      <div id="bubble">{text}</div>
    </div>
  )
}

/** Original `.screen`. Mounting a Screen is a screen change: timers, chooser, speech and bubble reset. */
export function Screen({ children, noGuide, onClick }: { children: ReactNode; noGuide?: boolean; onClick?: (e: MouseEvent<HTMLDivElement>) => void }) {
  const engine = useEngine()
  // Layout effect: runs before any child's passive effect, so a child's say()/choose() is not wiped.
  useLayoutEffect(() => { engine.newScreen() }, [engine])
  return (
    <div className="screen" onClick={onClick}>
      {children}
      {!noGuide && <Guide />}
    </div>
  )
}
