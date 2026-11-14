import { useRef, useState } from 'react'
import { Screen } from '../../components/Screen'
import { Sprite } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { eul } from '../../engine/korean'
import type { GameProps } from '../../shell/games'
import { flash } from '../shared/dom'
import { FRIENDS, friendKeys } from '../shared/friends'
import { useGame } from '../shared/useGame'
import { TOTAL } from './config'
import { makeQuestion, type SizeQuestion } from './logic'

/** Original sizeGame (index.html:521): find the biggest (or smallest) picture. */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const [view, setView] = useState<{ q: number; qn: SizeQuestion | null }>({ q: 0, qn: null })
  const btns = useRef<(HTMLButtonElement | null)[]>([])

  useGame(props, g => {
    const { engine, say, later } = g
    const keys = friendKeys(age)
    let q = 0

    function next() {
      q++
      if (q > TOTAL) { g.finish('크고 작은 걸 잘 찾았어!'); return }
      const qn = makeQuestion(keys, age)
      const { key, order, wantSmall, target } = qn
      g.commit(() => setView({ q, qn }))
      const els = btns.current.slice(0, order.length)
      const kind = wantSmall ? '제일 작은 ' : '제일 큰 '
      say(kind + FRIENDS[key].name + eul(FRIENDS[key].name) + ' 찾아 봐!', kind + FRIENDS[key].name + '!')
      const ask = () => engine.choose(els, i => {
        if (order[i] === target) {
          engine.sfx.good()
          flash(els[i], 'pop')
          say('맞았어! ' + (wantSmall ? '제일 작아!' : '제일 커!'))
          later(next, 1500)
        } else {
          engine.sfx.soft()
          els[i]?.classList.remove('picked')
          flash(els[i], 'nope')
          say(wantSmall ? '더 작은 걸 찾아 볼까?' : '더 큰 걸 찾아 볼까?')
          later(ask, 1300)
        }
      })
      ask()
    }
    next()
  })

  const { qn } = view
  return (
    <Screen>
      <div className="row" style={{ alignItems: 'flex-end', gap: 24 }}>
        {qn?.order.map((sz, i) => (
          <TapButton key={`${view.q}-${i}`} ref={el => { btns.current[i] = el }} style={{ width: 180, height: 200, justifyContent: 'flex-end', paddingBottom: 16 }}>
            <Sprite name={FRIENDS[qn.key].img} size={sz} alt={FRIENDS[qn.key].name} />
          </TapButton>
        ))}
      </div>
    </Screen>
  )
}
