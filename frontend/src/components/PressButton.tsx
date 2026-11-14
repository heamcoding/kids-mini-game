import type { CSSProperties, ReactNode, Ref } from 'react'
import { TapButton } from './TapButton'

export type PressButtonProps = {
  children?: ReactNode
  /** aria-label of the button (e.g. "주사위 굴리기"). */
  label: string
  btnRef?: Ref<HTMLButtonElement>
  labelRef?: Ref<HTMLSpanElement>
  /** Button size/shape (width, height, border...). */
  style?: CSSProperties
  /** Overrides for the column wrapper (default gap 26px). */
  wrapStyle?: CSSProperties
  labelSize?: number
}

/**
 * The big pulsing "press me" button with the "눌러요!" caption under it
 * (original die / card / spinner markup: `.tap.attn` + `.jua` label). Drive it with `armPress()`.
 */
export function PressButton({ children, label, btnRef, labelRef, style, wrapStyle, labelSize = 26 }: PressButtonProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, ...wrapStyle }}>
      <TapButton ref={btnRef} className="attn" style={style} label={label}>{children}</TapButton>
      <span ref={labelRef} className="jua" style={{ display: 'inline-block', minHeight: 36, minWidth: 120, textAlign: 'center', fontSize: labelSize, color: '#1F4F85' }}>눌러요!</span>
    </div>
  )
}
