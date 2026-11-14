import { ChoiceRow } from '../components/ChoiceRow'
import { Mongsil } from '../components/Mongsil'
import { Screen } from '../components/Screen'
import { Title } from '../components/Title'
import { getAudio } from '../engine/audio'

export function StartScreen({ onStart }: { onStart(): void }) {
  return (
    <Screen noGuide>
      <div style={{ fontSize: 0 }}><Mongsil size={280} /></div>
      <Title>몽실이와 놀이터</Title>
      <ChoiceRow
        items={['시작!']}
        rowClassName=""
        render={t => <span className="jua" style={{ fontSize: 40 }}>{t}</span>}
        buttonStyle={{ width: 220, height: 110 }}
        onPick={() => { getAudio(); onStart() }}
      />
    </Screen>
  )
}
