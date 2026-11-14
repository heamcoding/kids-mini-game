import type { GameProps } from '../../shell/games'
import { QuizGame } from '../shared/QuizGame'
import type { QuizSpec } from '../shared/quiz'
import { makeQuestion } from './logic'

/** Original numberGame (index.html:554): find the spoken number. */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const spec: QuizSpec = { done: '숫자를 잘 찾았어!', gen: () => makeQuestion(age) }
  return <QuizGame {...props} spec={spec} />
}
