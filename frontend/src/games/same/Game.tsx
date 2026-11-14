import { useRef, useState } from 'react'
import { Screen } from '../../components/Screen'
import { QuestionCard } from '../../components/QuestionCard'
import { Sprite } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { iya } from '../../engine/korean'
import type { GameProps } from '../../shell/games'
import { flash } from '../shared/dom'
import { FRIENDS, friendKeys } from '../shared/friends'
import { useGame } from '../shared/useGame'
import { cfg as CFG, TOTAL } from './config'
import { makeQuestion } from './logic'

/** Original sameGame (index.html:451): find the same picture as the one being asked for. */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const cfg = CFG[age]
  const [state, setState] = useState<{ q: number; list: string[]; solved: boolean }>({ q: 0, list: [], solved: false })
  const ansRef = useRef<string | null>(null)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const settingsRef = useRef(props.settings)
  settingsRef.current = props.settings

  useGame(props, g => {
    const { engine, say, later } = g
    const keys = friendKeys(age)
    let q = 0

    function next() {
      q++
      if (q > TOTAL) { g.finish('같은 그림을 다 찾았어!'); return }
      const { ans, list } = makeQuestion(keys, cfg)
      ansRef.current = ans
      g.commit(() => setState({ q, list, solved: false }))
      say(FRIENDS[ans].name + ' 찾아 보자!')
      const els = btns.current.slice(0, list.length)
      const ask = () => engine.choose(els, k => {
        if (list[k] === ans) {
          engine.sfx.good()
          g.commit(() => setState({ q, list, solved: true }))
          say('맞았어! ' + FRIENDS[ans].name + '!')
          later(next, 1700)
        } else {
          engine.sfx.soft()
          els[k]?.classList.remove('picked')
          flash(els[k], 'nope')
          say('이건 ' + FRIENDS[list[k]].name + iya(FRIENDS[list[k]].name) + '. ' + FRIENDS[ans].name + ' 어디 있지?')
          later(ask, 1500)
        }
      })
      ask()
    }
    next()
  })

  const ans = ansRef.current
  return (
    <Screen>
      <QuestionCard
        width={150}
        front={state.solved && ans ? <Sprite name={FRIENDS[ans].img} size={120} alt={FRIENDS[ans].name} /> : null}
        onReplay={() => {
          if (ans && settingsRef.current.control !== 'space') props.engine.speak(FRIENDS[ans].name + ' 찾아 보자!')
        }}
      />
      <div className="row" style={{ maxWidth: 1000, marginTop: 'calc(var(--vh)*5)' }}>
        {state.list.map((k, i) => (
          <TapButton key={`${state.q}-${i}`} ref={el => { btns.current[i] = el }} style={{ width: cfg > 4 ? 130 : 150, height: cfg > 4 ? 140 : 160 }}>
            <Sprite name={FRIENDS[k].img} size={cfg > 4 ? 90 : 110} alt={FRIENDS[k].name} />
          </TapButton>
        ))}
      </div>
    </Screen>
  )
}
