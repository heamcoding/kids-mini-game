import type { CSSProperties, ReactNode } from 'react'

/** Original `.btn` / `.btn.primary` (settings panel, rest screen). */
export function Button({ children, onClick, primary, style, label }: { children: ReactNode; onClick?: () => void; primary?: boolean; style?: CSSProperties; label?: string }) {
  return (
    <button type="button" className={primary ? 'btn primary' : 'btn'} style={style} aria-label={label} onClick={onClick}>
      {children}
    </button>
  )
}
