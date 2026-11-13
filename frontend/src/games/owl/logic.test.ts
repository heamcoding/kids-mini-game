import { expect, it } from 'vitest'
import { COLS } from '../../components/ColorTile'
import { aheadColors, judgePick } from './logic'

const [R, Y, B] = COLS
const seq = [R, Y, B, R, Y, B]

it('aheadColors: colours within the next two cells', () => {
  expect(aheadColors([R, Y, B], seq, -1).map(c => c.id)).toEqual(['red', 'yellow'])
  expect(aheadColors([R, Y, B], seq, 4).map(c => c.id)).toEqual(['blue'])
})

it('judgePick: ok within two cells, far beyond, wrong colour otherwise', () => {
  expect(judgePick(seq, -1, 0, 'red')).toBe('ok')
  expect(judgePick(seq, -1, 1, 'yellow')).toBe('ok')
  expect(judgePick(seq, -1, 3, 'red')).toBe('far')
  expect(judgePick(seq, -1, 1, 'red')).toBe('wrong')
})
