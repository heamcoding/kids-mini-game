import { useRef, useState } from 'react'
import { Hint } from '../../components/Hint'
import { Screen } from '../../components/Screen'
import { SpeakerIcon } from '../../components/SpeakerIcon'
import { TapButton } from '../../components/TapButton'
import type { GameProps } from '../../shell/games'
import { flash } from './dom'
import { QUIZ_TOTAL, quizTiming, type QuizOpt, type QuizSpec } from './quiz'
import { shuffle } from './random'
import { useGame } from './useGame'

type View = { q: number; opts: QuizOpt[]; shown: QuizOpt | null }

/**
 * Original quizGame(spec) (index.html:532), shared by the number / ABC / 가나다 games:
 * five questions, each spoken and shown as a row of options; wrong picks give a hint, silence reveals the answer.
 */
export function QuizGame({ spec, ...props }: GameProps & { spec: QuizSpec }) {
  const [view, setView] = useState<View>({ q: 0, opts: [], shown: null })
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const curRef = useRef<QuizOpt | null>(null)
  const settingsRef = useRef(props.settings)
  settingsRef.current = props.settings

  useGame(props, g => {
    const { engine, say } = g
    const S = props.settings
    let q = 0
    // The original kept per-question timers in an array and cleared them together; an epoch does the same.
    let epoch = 0
    const clearT = () => { epoch++ }
    const at = (fn: () => void, ms: number) => { const e = epoch; g.timeout(() => { if (e === epoch) fn() }, ms) }

    function next() {
      clearT()
      q++
      if (q > QUIZ_TOTAL) { g.finish(spec.done); return }
      const gen = spec.gen()
      const cur = gen.ans
      curRef.current = cur
      const list = shuffle(gen.opts)
      g.commit(() => setView({ q, opts: list, shown: null }))
      const els = btns.current.slice(0, list.length)
      const ai = list.indexOf(cur)
      const { limit, hintAt } = quizTiming(S.control, S.scan, S.touchTime, list.length)
      say(cur.sound + '! 어디 있을까?', spec.hideText ? '잘 듣고 찾아 봐!' : cur.sound + '!')
      // Original `t === token && !settingsOpen`: a screen change or the settings panel kills pending timers.
      const t = engine.scheduler.token()
      const live = () => t === engine.scheduler.token() && !engine.isSettingsOpen()
      let wrong = 0
      const reveal = () => g.commit(() => setView(v => ({ ...v, shown: cur })))
      at(() => {
        if (!live() || wrong > 0) return
        els[ai]?.classList.add('hint')
        engine.speak(cur.sound)
      }, hintAt * 1000)
      at(() => {
        if (!live()) return
        engine.stopChoose()
        els[ai]?.classList.add('hint')
        reveal()
        say('정답은|' + cur.sound + (q < QUIZ_TOTAL ? '! 다음 문제!' : '!'), '정답은 ' + cur.label)
        at(() => { if (t === engine.scheduler.token()) next() }, 2600)
      }, limit * 1000)
      const ask = () => engine.choose(els, i => {
        if (i === ai) {
          clearT()
          els[i]?.classList.remove('hint')
          reveal()
          engine.sfx.good()
          say('맞았어! ' + (cur.word || cur.sound) + '!', '맞았어! ' + cur.label)
          at(() => { if (t === engine.scheduler.token()) next() }, 1800)
        } else {
          wrong++
          engine.sfx.soft()
          els[i]?.classList.remove('picked')
          flash(els[i], 'nope')
          if (wrong >= 2) els[ai]?.classList.add('hint')
          engine.speak('다시 들어 봐. ' + cur.sound)
          at(() => { if (live()) ask() }, 900)
        }
      })
      ask()
    }
    next()
  })

  const shown = view.shown
  return (
    <Screen>
      <div className="row" style={{ gap: 20 }}>
        {shown ? (
          <div className="tap pop" style={{ width: 140, height: 170, cursor: 'default' }}>
            <span className="jua" style={{ fontSize: 64 }}>{shown.label}</span>
          </div>
        ) : (
          <div className="tap card-back" style={{ width: 140, height: 170, cursor: 'default' }}>
            <span className="jua" style={{ fontSize: 60, color: '#fff' }}>?</span>
          </div>
        )}
        <TapButton label="다시 듣기" style={{ width: 96, height: 96 }} onPick={() => {
          const cur = curRef.current
          if (cur && settingsRef.current.control !== 'space') props.engine.speak(cur.sound)
        }}>
          <SpeakerIcon />
        </TapButton>
      </div>
      <div className="row" style={{ marginTop: 'calc(var(--vh)*5)' }}>
        {view.opts.map((o, i) => (
          <TapButton key={`${view.q}-${i}`} ref={el => { btns.current[i] = el }} label={o.sound} style={{ width: 'clamp(110px,calc(var(--vw)*14),150px)', height: 'clamp(130px,calc(var(--vh)*22),170px)' }}>
            <span className="jua" style={{ fontSize: 'clamp(48px,calc(var(--vh)*9),72px)' }}>{o.label}</span>
          </TapButton>
        ))}
      </div>
      <Hint>{view.q > 0 ? `${view.q} / ${QUIZ_TOTAL}` : ''}</Hint>
    </Screen>
  )
}
