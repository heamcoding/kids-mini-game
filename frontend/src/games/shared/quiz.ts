import type { Settings } from '../../settings/types'

/** One answer option of a quiz question: what is shown, what is spoken, and the example word said on a right answer. */
export type QuizOpt = { label: string; sound: string; word?: string }
export type QuizQuestion = { ans: QuizOpt; opts: QuizOpt[] }
/** Original quizGame spec: `done` is the finish message, `hideText` hides the spoken answer in the bubble. */
export type QuizSpec = { done: string; hideText?: boolean; gen(): QuizQuestion }

/** Original quizGame `total`. */
export const QUIZ_TOTAL = 5

/**
 * Original quizGame timing: after `hintAt` seconds without a wrong pick the answer starts hinting,
 * after `limit` seconds the answer is revealed and the quiz moves on.
 */
export function quizTiming(control: Settings['control'], scan: number, touchTime: number, n: number): { limit: number; hintAt: number } {
  const cycle = scan * n
  if (control === 'touch') return { limit: touchTime, hintAt: touchTime / 2 }
  if (control === 'space') return { limit: cycle * 2, hintAt: cycle }
  return { limit: Math.max(touchTime, cycle * 2), hintAt: Math.max(touchTime / 2, cycle) }
}
