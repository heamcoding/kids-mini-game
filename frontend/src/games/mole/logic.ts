import { KDET } from '../../engine/korean'
import { rnd } from '../shared/random'

/** Original `do { i = rnd(holes) } while (i === last && holes > 1)`. */
export function pickHole(last: number, holes: number): number {
  let i: number
  do { i = rnd(holes) } while (i === last && holes > 1)
  return i
}

export function finishMessage(hits: number, total: number): string {
  return hits >= total ? '두더지를 다 잡았어!' : hits > 0 ? '두더지를 ' + KDET[hits] + ' 마리 잡았어!' : '두더지가 다 숨었어! 다음엔 꼭 잡아 보자!'
}
