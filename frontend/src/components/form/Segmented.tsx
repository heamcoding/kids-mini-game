import { TapButton } from '../TapButton'


export type SegmentedProps<T extends string | number> = {
  value: T | null
  options: { value: T; label: string }[]
  onChange(v: T): void
  /** `radio` = labelled radios (original control tab); `buttons` = big pick buttons (original age tab). */
  variant?: 'radio' | 'buttons'
  name?: string
}

export function Segmented<T extends string | number>({ value, options, onChange, variant = 'radio', name = 'seg' }: SegmentedProps<T>) {
  if (variant === 'buttons') {
    return (
      <div className="row" style={{ justifyContent: 'flex-start' }}>
        {options.map(o => (
          <TapButton key={o.value} picked={value === o.value} pressed={value === o.value} style={{ width: 120, height: 80 }} onPick={() => onChange(o.value)}>
            <span className="jua" style={{ fontSize: 30 }}>{o.label}</span>
          </TapButton>
        ))}
      </div>
    )
  }
  return (
    <>
      {options.map(o => (
        <label key={o.value} className="radio">
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          {o.label}
        </label>
      ))}
    </>
  )
}

