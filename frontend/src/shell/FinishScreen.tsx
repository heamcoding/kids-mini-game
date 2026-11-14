import { useEffect } from 'react'
import { Mongsil } from '../components/Mongsil'
import { Screen } from '../components/Screen'
import { Title } from '../components/Title'
import { tone } from '../engine/audio'
import { useEngine } from '../engine/context'
import { confetti } from './confetti'

export function FinishScreen({ msg, onDone }: { msg?: string; onDone(): void }) {
  const engine = useEngine()
  const text = msg || '정말 잘했어!'
  useEffect(() => {
    engine.sfx.win()
    engine.say(text)
    confetti()
    engine.later(() => { tone([784, 988, 1175], 0.18, 'triangle', 0.09); confetti() }, 900)
    engine.later(onDone, 3600)
  }, [engine, text, onDone])
  return (
    <Screen noGuide>
      <div className="dance"><Mongsil size={260} alt="춤추는 몽실이" /></div>
      <Title>{text}</Title>
    </Screen>
  )
}
