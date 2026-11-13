import { useEffect } from 'react'
import { ChoiceRow } from '../components/ChoiceRow'
import { Hint } from '../components/Hint'
import { Screen } from '../components/Screen'
import { Title } from '../components/Title'
import { useEngine } from '../engine/context'
import { KDET } from '../engine/korean'
import { AGE_DEF } from '../settings/defaults'
import type { Settings } from '../settings/types'

const AGES = [3, 4, 5] as const

export function AgeScreen({ update, onDone }: { update(patch: Partial<Settings>): void; onDone(): void }) {
  const engine = useEngine()
  useEffect(() => { engine.say('안녕! 나는 몽실이야. 몇 살이에요?') }, [engine])
  return (
    <Screen>
      <Title>몇 살이에요?</Title>
      <ChoiceRow
        items={[...AGES]}
        getLabel={n => n + '살'}
        buttonStyle={{ width: 170, height: 200 }}
        render={n => (
          <>
            <span className="jua" style={{ fontSize: 80, lineHeight: 1 }}>{n}</span>
            <span style={{ fontSize: 22, letterSpacing: 4, color: '#2F6FB5' }}>{'●'.repeat(n)}</span>
          </>
        )}
        onPick={age => {
          update({ age, ...AGE_DEF[age] })
          engine.say(KDET[age] + ' 살이구나! 같이 놀자!')
          engine.later(onDone, 1600)
        }}
      />
      <Hint>숫자를 누르거나, 스페이스바를 눌러 골라요</Hint>
    </Screen>
  )
}
