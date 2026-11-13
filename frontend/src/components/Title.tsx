import type { CSSProperties, ReactNode } from 'react'

export function Title({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <h1 className={['title', className].filter(Boolean).join(' ')} style={style}>{children}</h1>
}
