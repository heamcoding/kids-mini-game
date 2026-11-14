export type SliderProps = { value: number; min: number; max: number; step: number; onChange(v: number): void; label?: string }

export function Slider({ value, min, max, step, onChange, label }: SliderProps) {
  return (
    <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} />
  )
}
