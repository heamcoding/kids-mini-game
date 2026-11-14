import { CANDY } from './config'
import { KDET } from '../../engine/korean'

/** Original plate: `snacks` candies cycling through the colours. */
export const plateItems = (snacks: number): string[] => Array.from({ length: snacks }, (_, i) => CANDY[i % CANDY.length])

/** Highest die value: the cfg max, but never more than the candies left. */
export const dieTop = (max: number, left: number): number => Math.min(max, left)

/** Original "n candies left" determiner (한/두.../열한...). */
export const leftDet = (left: number): string => (left <= 10 ? KDET[left] : '열' + KDET[left - 10])
