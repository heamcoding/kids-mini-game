import type { GameProps } from '../../shell/games'
import { QuizGame } from '../shared/QuizGame'
import type { QuizSpec } from '../shared/quiz'
import { makeQuestion } from './logic'

/** Original korGame (index.html:565): find the spoken syllable (the bubble does not show it). */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const spec: QuizSpec = { done: '한글을 잘 찾았어!', hideText: true, gen: () => makeQuestion(age) }
  return <QuizGame {...props} spec={spec} />
}
