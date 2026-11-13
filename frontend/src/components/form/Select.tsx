export type SelectProps = { value: string; options: { value: string; label: string }[]; onChange(v: string): void; label?: string }

export function Select({ value, options, onChange, label }: SelectProps) {
  return (
    <select aria-label={label} value={value} onChange={e => onChange(e.target.value)} style={{ height: 48, borderRadius: 12, border: '2px solid #E3D9C7', fontSize: 16, padding: '0 10px' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
