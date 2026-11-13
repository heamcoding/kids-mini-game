import { Mongsil } from '../components/Mongsil'
import { Screen } from '../components/Screen'
import { Title } from '../components/Title'

export function LoadingScreen() {
  return (
    <Screen noGuide>
      <div className="ld-bob"><Mongsil size={170} /></div>
      <Title style={{ marginTop: 6 }}>준비하고 있어요</Title>
      <div className="ld-dots" aria-hidden="true"><span /><span /><span /></div>
    </Screen>
  )
}
