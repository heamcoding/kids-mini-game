import { forwardRef, type CSSProperties, type PointerEvent, type ReactNode } from 'react'

export type TapButtonProps = {
  children?: ReactNode
  /** Plain click handler. Inside a ChoiceRow leave it unset: the chooser owns picking. */
  onPick?: () => void
  /** Raw pointerdown (the bear plate needs to know which candy was touched). */
  onPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void
  label?: string
  scan?: boolean
  picked?: boolean
  pressed?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

/** Original `B()` / `.tap` button. `scan` and `picked` mirror the chooser's highlight classes. */
export const TapButton = forwardRef<HTMLButtonElement, TapButtonProps>(function TapButton(
  { children, onPick, onPointerDown, label, scan, picked, pressed, disabled, className, style },
  ref,
) {
  const cls = ['tap', className, scan && 'scan', picked && 'picked'].filter(Boolean).join(' ')
  return (
    <button ref={ref} type="button" className={cls} style={style} aria-label={label} aria-pressed={pressed} disabled={disabled} onClick={onPick} onPointerDown={onPointerDown}>
      {children}
    </button>
  )
})
