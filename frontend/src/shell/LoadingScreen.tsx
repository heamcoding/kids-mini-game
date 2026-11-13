import { Mongsil } from '../components/Mongsil'
import { Screen } from '../components/Screen'

export function LoadingScreen() {
  return (
    <Screen noGuide>
      <div className="ld-bob"><Mongsil size={170} /></div>
      <h1 className="title" style={{ marginTop: 6 }}>준비하고 있어요</h1>
      <div className="ld-dots" aria-hidden="true"><span /><span /><span /></div>
    </Screen>
  )
}
