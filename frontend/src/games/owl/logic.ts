import type { Col } from '../../components/ColorTile'

/** Colours (in `cols` order) that appear in the next two cells after `pos`: the card only shows reachable colours. */
export function aheadColors(cols: Col[], seq: Col[], pos: number): Col[] {
  return cols.filter(c => seq.some((q, i) => i > pos && i <= pos + 2 && q.id === c.id))
}

/** ok: right colour within two cells; far: right colour but further; wrong: other colour. */
export function judgePick(seq: Col[], pos: number, i: number, colId: string): 'ok' | 'far' | 'wrong' {
  if (seq[i].id === colId && i <= pos + 2) return 'ok'
  if (seq[i].id === colId) return 'far'
  return 'wrong'
}
