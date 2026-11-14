import { shuffle } from '../shared/random'

/** Original deck: `pairs` distinct kinds, each twice, shuffled. */
export function makeDeck(keys: string[], pairs: number): string[] {
  const kinds = shuffle(keys).slice(0, pairs)
  return shuffle(kinds.concat(kinds))
}

export const isMatch = (a: string, b: string): boolean => a === b
