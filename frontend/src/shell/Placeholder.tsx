import type { ComponentType } from 'react'
import { ChoiceRow } from '../components/ChoiceRow'
import { Screen } from '../components/Screen'
import { Title } from '../components/Title'
import type { GameProps } from './games'

/** Stand-in until the real game lands (Task 7). */
export function makePlaceholder(title: string): ComponentType<GameProps> {
  return function PlaceholderGame({ onFinish }: GameProps) {
    return (
      <Screen>
        <Title>{title}</Title>
        <ChoiceRow items={['끝내기']} render={x => <span className="jua" style={{ fontSize: 32 }}>{x}</span>} getLabel={x => x} onPick={() => onFinish()} buttonStyle={{ width: 220, height: 110 }} />
      </Screen>
    )
  }
}
