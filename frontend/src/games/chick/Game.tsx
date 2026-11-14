import { useRef, useState } from 'react'
import { Screen } from '../../components/Screen'
import { Sprite } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { KDET, KNUM } from '../../engine/korean'
import type { GameProps } from '../../shell/games'
import { flash } from '../shared/dom'
import { useGame } from '../shared/useGame'
import { cfg as CFG, TOTAL } from './config'
import { chickSize, makeQuestion } from './logic'

type Q = { q: number; n: number; nums: number[] }

/** Original chickGame (index.html:315): count the chicks, pick the number. */
export default function Game(props: GameProps) {
  const c = CFG[props.settings.age || 3]
  const [qs, setQs] = useState<Q | null>(null)
  const [shown, setShown] = useState(0)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const chicks = useRef<(HTMLDivElement | null)[]>([])

  useGame(props, g => {
    const { engine, say, later } = g
    let q = 0

    function next() {
      q++
      if (q > TOTAL) { g.finish('병아리를 다 셌어!'); return }
      const { n, nums } = makeQuestion(c)
      g.commit(() => { setQs({ q, n, nums }); setShown(0) })
      let i = 0
      const add = () => {
        if (i >= n) { ask(); return }
        i++
        g.commit(() => setShown(i))
        engine.sfx.flip()
        if (c.countAlong) say(KNUM[i], undefined, add)
        else later(add, 350)
      }
      if (c.countAlong) say('병아리가 나와요! 같이 세어 보자.', undefined, add)
      else { say('병아리가 몇 마리일까?'); later(add, 900) }

      function ask() {
        say(c.countAlong ? '모두 ' + KDET[n] + ' 마리! 숫자를 찾아 보자.' : '몇 마리야? 숫자를 눌러 봐.')
        const els = btns.current.slice(0, nums.length)
        const cs = chicks.current.slice(0, n)
        engine.choose(els, k => {
          if (nums[k] === n) {
            engine.sfx.good()
            say('맞았어! ' + KDET[n] + ' 마리야!')
            cs.forEach((ch, j) => g.timeout(() => {
              if (!ch) return
              ch.style.transition = 'all .4s'
              ch.style.opacity = '0'
              ch.style.transform = 'translateX(60px)'
            }, j * 120))
            later(next, 1600 + n * 100)
          } else {
            engine.sfx.soft()
            els[k]?.classList.remove('picked')
            flash(els[k], 'nope')
            let j = 0
            const cnt = () => {
              cs.forEach(ch => { if (ch) ch.style.transform = '' })
              if (j >= n) { ask(); return }
              const ch = cs[j]
              if (ch) ch.style.transform = 'scale(1.25)'
              j++
              say(KNUM[j], undefined, cnt)
            }
            say('다시 같이 세어 보자.', undefined, cnt)
          }
        })
      }
    }
    next()
  })

  const size = qs ? chickSize(qs.n) : 110
  return (
    <Screen>
      <div className="panel" style={{ background: '#FFF3CF', minWidth: 'min(calc(var(--vw)*80),820px)', minHeight: 'clamp(150px,calc(var(--vh)*26),240px)', flexWrap: 'wrap', gap: 6, maxWidth: 'calc(var(--vw)*90)' }}>
        {qs && Array.from({ length: shown }, (_, i) => (
          <div key={`${qs.q}-${i}`} ref={el => { chicks.current[i] = el }} className="pop" style={{ display: 'inline-flex', ...(i === 5 ? { marginLeft: 28 } : {}) }}>
            <Sprite name="chick1" size={size} alt="병아리" />
          </div>
        ))}
      </div>
      <div className="row">
        {qs?.nums.map((v, i) => (
          <TapButton key={`${qs.q}-${i}`} ref={el => { btns.current[i] = el }} label={String(v)} style={{ width: 'clamp(104px,calc(var(--vw)*13),140px)', height: 'clamp(120px,calc(var(--vh)*20),160px)' }}>
            <span className="jua" style={{ fontSize: 'clamp(46px,calc(var(--vh)*8),66px)', lineHeight: 1 }}>{v}</span>
            {c.dots && <span style={{ color: '#2F6FB5', fontSize: 14, letterSpacing: 2 }}>{'●'.repeat(v)}</span>}
          </TapButton>
        ))}
      </div>
    </Screen>
  )
}
