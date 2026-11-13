import { forwardRef, type CSSProperties, type ReactNode } from 'react'

export type TapButtonProps = {
  children?: ReactNode
  /** Plain click handler. Inside a ChoiceRow leave it unset: the chooser owns picking. */
  onPick?: () => void
  label?: string
  scan?: boolean
  picked?: boolean
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

/** Original `B()` / `.tap` button. `scan` and `picked` mirror the chooser's highlight classes. */
export const TapButton = forwardRef<HTMLButtonElement, TapButtonProps>(function TapButton(
  { children, onPick, label, scan, picked, disabled, className, style },
  ref,
) {
  const cls = ['tap', className, scan && 'scan', picked && 'picked'].filter(Boolean).join(' ')
  return (
    <button ref={ref} type="button" className={cls} style={style} aria-label={label} disabled={disabled} onClick={onPick}>
      {children}
    </button>
  )
})
