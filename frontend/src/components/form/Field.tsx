import type { ReactNode } from 'react'

export function Field({ label, value, children }: { label: string; value?: ReactNode; children: ReactNode }) {
  return (
    <div className="field">
      <div className="lab">
        <span>{label}</span>
        {value !== undefined && <span className="val">{value}</span>}
      </div>
      {children}
    </div>
  )
}
