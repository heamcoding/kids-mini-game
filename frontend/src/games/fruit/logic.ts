import { rnd, shuffle } from '../shared/random'

export type Face = 'F' | 'R'

/**
 * Original die plan: decided up front. If the raven wins it gets all `steps` raven faces (the last roll is
 * a raven) and the kid only gets 1..F-1 fruit faces; otherwise the kid gets all F fruit faces (the last roll
 * is a fruit) and the raven fewer than `steps`.
 */
export function makePlan(F: number, steps: number, ravenWins: boolean): Face[] {
  let fr: number, rv: number
  if (ravenWins) { fr = Math.max(1, F - 1 - rnd(3)); rv = steps } else { fr = F; rv = rnd(steps) }
  const body = shuffle<Face>(Array<Face>(fr - (ravenWins ? 0 : 1)).fill('F').concat(Array<Face>(rv - (ravenWins ? 1 : 0)).fill('R')))
  return body.concat([ravenWins ? 'R' : 'F'])
}

/** Original nextFace(): takes the next plan entry (mutates `plan`); a fruit face shows a random kind still on the tree. */
export function nextFace<K extends string>(plan: Face[], kindsLeft: K[]): K | 'raven' {
  const t = plan.shift()
  if (t === 'R' || !kindsLeft.length) return 'raven'
  return kindsLeft[rnd(kindsLeft.length)]
}
