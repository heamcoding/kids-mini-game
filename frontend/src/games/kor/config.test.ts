import { expect, it } from 'vitest'
import { cfg, GANA, GANA_B } from './config'
import { makeQuestion } from './logic'
import { setRandom } from '../shared/random'
import { mulberry32 } from '../test/harness'

// Original GANA / GANA_B (index.html:563) and korGame (565).
it('가나다 tables and per-age cfg match the original', () => {
  expect(GANA).toHaveLength(14)
  expect(GANA.map(x => x[0]).join('')).toBe('가나다라마바사아자차카타파하')
  expect(GANA[0]).toEqual(['가', '가방'])
  expect(GANA[13]).toEqual(['하', '하마'])
  expect(GANA_B).toEqual([['각', '각도기'], ['난', '난초'], ['달', '달'], ['말', '말'], ['밤', '밤'], ['산', '산'], ['강', '강아지'], ['곰', '곰'], ['눈', '눈'], ['별', '별']])
  expect(cfg).toEqual({ 3: { n: 3, extra: false }, 4: { n: 4, extra: false }, 5: { n: 4, extra: true } })
})

it('ages 3/4 use only the basic syllables; age 5 adds the final-consonant ones', () => {
  const basic = GANA.map(x => x[0]), extra = GANA_B.map(x => x[0])
  setRandom(mulberry32(34))
  for (const age of [3, 4] as const) for (let i = 0; i < 50; i++) for (const o of makeQuestion(age).opts) expect(basic).toContain(o.label)
  setRandom(mulberry32(5))
  let seenExtra = false
  for (let i = 0; i < 100; i++) for (const o of makeQuestion(5).opts) if (extra.includes(o.label)) seenExtra = true
  expect(seenExtra).toBe(true)
})

it('options are distinct, the answer is first, label = sound = syllable, word = "가, 가방"', () => {
  for (const age of [3, 4, 5] as const) {
    setRandom(mulberry32(age * 11))
    for (let i = 0; i < 40; i++) {
      const { ans, opts } = makeQuestion(age)
      expect(opts).toHaveLength(age === 3 ? 3 : 4)
      expect(opts[0]).toBe(ans)
      expect(new Set(opts.map(o => o.label)).size).toBe(opts.length)
      for (const o of opts) {
        expect(o.sound).toBe(o.label)
        const row = [...GANA, ...GANA_B].find(x => x[0] === o.label)!
        expect(o.word).toBe(row[0] + ', ' + row[1])
      }
    }
  }
})
