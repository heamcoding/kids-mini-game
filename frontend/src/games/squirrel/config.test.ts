import { expect, it } from 'vitest'
import { AC, cfg } from './config'

// Original squirrelGame (index.html:374): per = {3:1,4:2,5:3}.
it('squirrel cfg (acorns per colour) matches the original per age', () => {
  expect(cfg).toEqual({ 3: 1, 4: 2, 5: 3 })
})

it('acorn colours match the original', () => {
  expect(AC).toEqual([
    { id: 'red', name: '빨간', img: 'acorn3_red', c: '#F04A3E' },
    { id: 'yellow', name: '노란', img: 'acorn3_yellow', c: '#FFCE30' },
    { id: 'blue', name: '파란', img: 'acorn3_blue', c: '#348CF0' },
  ])
})
