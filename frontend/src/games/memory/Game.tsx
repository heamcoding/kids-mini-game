import { useRef, useState } from 'react'
import { Screen } from '../../components/Screen'
import { Sprite } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { Title } from '../../components/Title'
import { getScale } from '../../engine/fit'
import type { GameProps } from '../../shell/games'
import { flash } from '../shared/dom'
import { FRIENDS, friendKeys } from '../shared/friends'
import { useGame } from '../shared/useGame'
import { cfg as CFG, COLS, ROUNDS } from './config'
import { isMatch, makeDeck } from './logic'

type Card = { k: string; up: boolean; done: boolean }

/** Original memoryGame (index.html:283): flip cards and find the matching pairs, three rounds. */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const cfg = CFG[age]
  const [round, setRound] = useState(1)
  const [cards, setCards] = useState<Card[]>([])
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const DH = innerHeight / getScale()

  useGame(props, g => {
    const { engine, say, later } = g

    function play(round: number) {
      const deck = makeDeck(friendKeys(age), cfg.pairs)
      const list: Card[] = deck.map(k => ({ k, up: false, done: false }))
      const sync = () => g.commit(() => setCards(list.map(c => ({ ...c }))))
      g.commit(() => { setRound(round); setCards(list.map(c => ({ ...c }))) })
      const el = (c: Card) => btns.current[list.indexOf(c)]
      let first: Card | null = null

      function turn() {
        const avail = list.filter(c => !c.done && !c.up)
        engine.choose(avail.map(el), i => {
          const c = avail[i]
          c.up = true
          engine.sfx.flip()
          sync()
          flash(el(c), 'pop')
          engine.speak(FRIENDS[c.k].name)
          if (!first) { first = c; later(turn, 700); return }
          const a = first
          first = null
          if (isMatch(a.k, c.k)) {
            later(() => {
              a.done = c.done = true
              sync()
              engine.sfx.good()
              say(FRIENDS[c.k].name + ' 짝꿍 찾았다!')
              if (list.every(x => x.done)) {
                if (round < ROUNDS) {
                  engine.sfx.win()
                  later(() => { say('다음 판!'); later(() => play(round + 1), 1000) }, 1300)
                } else later(() => g.finish('짝꿍을 다 찾았어!'), 1400)
              } else later(turn, 1300)
            }, 900)
          } else {
            later(() => {
              say('다르네. 다시 덮을게.')
              a.up = c.up = false
              sync()
              later(turn, 1200)
            }, 1300)
          }
        })
      }

      if (cfg.preview) {
        list.forEach(c => { c.up = true })
        sync()
        say('잘 봐! 어디에 누가 있을까?')
        later(() => {
          list.forEach(c => { c.up = false })
          sync()
          say('이제 짝꿍을 찾아 보자!')
          later(turn, 1300)
        }, 3500)
      } else {
        say('카드를 뒤집어서 짝꿍을 찾아 보자!')
        later(turn, 1500)
      }
    }
    play(1)
  })

  const cols = COLS[cfg.pairs] || 4
  return (
    <Screen>
      <Title>짝꿍을 찾아요 <span style={{ color: '#2F6FB5' }}>{round} / {ROUNDS}</span></Title>
      <div id="cards" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},auto)`, gap: 'clamp(12px,calc(var(--vh)*2.2),22px)', justifyContent: 'center' }}>
        {cards.map((c, i) => (
          <TapButton
            key={`${round}-${i}`}
            ref={el => { btns.current[i] = el }}
            label="카드"
            className={[c.up || c.done ? '' : 'card-back', c.done ? 'card-done' : ''].filter(Boolean).join(' ') || undefined}
            style={{ width: 'calc(var(--vh)*19)', height: 'calc(var(--vh)*25)' }}
          >
            {c.up || c.done
              ? <Sprite name={FRIENDS[c.k].img} size={Math.round(DH * 0.15)} alt={FRIENDS[c.k].name} />
              : <span className="jua" style={{ fontSize: 48, color: '#fff' }}>?</span>}
          </TapButton>
        ))}
      </div>
    </Screen>
  )
}
