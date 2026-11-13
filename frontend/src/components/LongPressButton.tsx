import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

export type LongPressButtonProps = {
  ms: number
  icon: ReactNode
  onTrigger(): void
  label?: string
  className?: string
  style?: CSSProperties
  id?: string
  /** Progress ring around the button (corner buttons); off for plain text buttons. */
  ring?: boolean
}

export function LongPressButton({ ms, icon, onTrigger, label, className = 'corner', style, id, ring = true }: LongPressButtonProps) {
  const circle = useRef<SVGCircleElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cb = useRef(onTrigger)
  cb.current = onTrigger

  const reset = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    const c = circle.current
    if (c) { c.style.transition = 'none'; c.style.strokeDashoffset = '176' }
  }
  const start = () => {
    reset()
    const c = circle.current
    if (c) { c.style.transition = `stroke-dashoffset ${ms}ms linear`; c.style.strokeDashoffset = '0' }
    timer.current = setTimeout(() => { reset(); cb.current() }, ms)
  }
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <button
      type="button"
      id={id}
      className={className}
      style={style}
      aria-label={label}
      onPointerDown={e => { e.preventDefault(); start() }}
      onPointerUp={reset}
      onPointerLeave={reset}
      onPointerCancel={reset}
      onClick={e => e.preventDefault()}
    >
      {icon}
      {ring && (
        <svg className="ringsvg" width="64" height="64" viewBox="0 0 64 64">
          <circle ref={circle} cx="32" cy="32" r="28" fill="none" stroke="#2F6FB5" strokeWidth="5" strokeDasharray="176" strokeDashoffset="176" strokeLinecap="round" transform="rotate(-90 32 32)" />
        </svg>
      )}
    </button>
  )
}
