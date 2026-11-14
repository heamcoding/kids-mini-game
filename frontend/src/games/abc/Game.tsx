import type { GameProps } from '../../shell/games'
import { QuizGame } from '../shared/QuizGame'
import type { QuizSpec } from '../shared/quiz'
import { makeQuestion } from './logic'

/** Original abcGame (index.html:559): find the spoken letter. */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const spec: QuizSpec = { done: '알파벳을 잘 찾았어!', gen: () => makeQuestion(age) }
  return <QuizGame {...props} spec={spec} />
}
