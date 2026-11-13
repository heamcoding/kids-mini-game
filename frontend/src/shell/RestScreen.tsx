import { useEffect } from 'react'
import { Hint } from '../components/Hint'
import { LongPressButton } from '../components/LongPressButton'
import { Mongsil } from '../components/Mongsil'
import { Screen } from '../components/Screen'
import { Title } from '../components/Title'
import { useEngine } from '../engine/context'
import { KDET } from '../engine/korean'

export function RestScreen({ rounds, onContinue }: { rounds: number; onContinue(): void }) {
  const engine = useEngine()
  useEffect(() => { engine.say(`${KDET[rounds] || rounds} 판이나 했네! 우리 잠깐 쉬자. 눈도 쉬고, 물도 마시자.`) }, [engine, rounds])
  return (
    <Screen noGuide>
      <div style={{ fontSize: 0 }}><Mongsil size={240} /></div>
      <Title>우리 잠깐 쉬자</Title>
      <Hint>보호자 분은 오른쪽 위 톱니 버튼을 길게 눌러 쉬는 판 수를 바꿀 수 있어요.</Hint>
      <LongPressButton ms={2000} ring={false} className="btn" style={{ padding: '0 22px' }} icon="보호자: 길게 눌러 계속하기" onTrigger={onContinue} />
    </Screen>
  )
}
