import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

/** Full-screen dimmed layer. Portaled to <body> so the scaled #app does not distort `position: fixed`. */
export function Overlay({ children }: { children: ReactNode }) {
  return createPortal(<div className="overlay" data-ov>{children}</div>, document.body)
}
