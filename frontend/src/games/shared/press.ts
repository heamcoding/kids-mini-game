import type { Engine } from '../../engine'
import { attn } from './dom'

/**
 * Original die / card / spinner turn: pulse the button, caption "눌러요!", wait for a pick,
 * then stop pulsing, clear the caption and run `onPress`.
 */
export function armPress(engine: Engine, btn: HTMLElement | null, label: HTMLElement | null, onPress: () => void): void {
  if (!btn) return
  attn(btn, true)
  if (label) label.textContent = '눌러요!'
  engine.choose([btn], () => {
    attn(btn, false)
    if (label) label.textContent = ''
    onPress()
  })
}
