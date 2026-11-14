import { expect, it } from 'vitest'
import { QUIZ_TOTAL, quizTiming } from './quiz'

// Original quizGame (index.html:532): five questions; limit / hint timing depends on the control mode.
it('asks five questions', () => { expect(QUIZ_TOTAL).toBe(5) })

it('touch only: limit is touchTime, hint at half of it', () => {
  expect(quizTiming('touch', 3, 10, 4)).toEqual({ limit: 10, hintAt: 5 })
})

it('space only: two scan cycles, hint after one', () => {
  expect(quizTiming('space', 3, 10, 4)).toEqual({ limit: 24, hintAt: 12 })
  expect(quizTiming('space', 2.5, 8, 3)).toEqual({ limit: 15, hintAt: 7.5 })
})

it('both: the longer of touch time and scan cycles', () => {
  expect(quizTiming('both', 3, 10, 3)).toEqual({ limit: 18, hintAt: 9 }) // cycle 9 -> max(10,18), max(5,9)
  expect(quizTiming('both', 1, 10, 3)).toEqual({ limit: 10, hintAt: 5 }) // cycle 3 -> max(10,6), max(5,3)
})
