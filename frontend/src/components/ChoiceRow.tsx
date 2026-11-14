import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useEngine } from '../engine/context'
import { TapButton } from './TapButton'

export type ChoiceRowProps<T> = {
  items: T[]
  render(item: T, i: number): ReactNode
  onPick(item: T, i: number): void
  getLabel?(item: T, i: number): string
  /** Wrapper class; defaults to the original `.row`. */
  rowClassName?: string
  buttonClassName?: string
  buttonStyle?: CSSProperties
  /** Change to re-arm the chooser for the same items. */
  resetKey?: unknown
}

/** One place for scan / touch / space picking: wires the engine chooser to the rendered buttons. */
export function ChoiceRow<T>({ items, render, onPick, getLabel, rowClassName = 'row', buttonClassName, buttonStyle, resetKey }: ChoiceRowProps<T>) {
  const engine = useEngine()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const latest = useRef({ items, onPick })
  latest.current = { items, onPick }

  useEffect(() => {
    engine.choose(refs.current.slice(0, latest.current.items.length), i => latest.current.onPick(latest.current.items[i], i))
    return () => engine.stopChoose()
  }, [engine, items.length, resetKey])

  return (
    <div className={rowClassName}>
      {items.map((it, i) => (
        <TapButton key={i} ref={el => { refs.current[i] = el }} className={buttonClassName} style={buttonStyle} label={getLabel?.(it, i)}>
          {render(it, i)}
        </TapButton>
      ))}
    </div>
  )
}
