import type { ReactNode } from 'react'

export function Hint({ children }: { children: ReactNode }) {
  return <p className="muted">{children}</p>
}
