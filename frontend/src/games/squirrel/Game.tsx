import { useRef, useState, type Ref } from 'react'
import { PressButton } from '../../components/PressButton'
import { Screen } from '../../components/Screen'
import { Sprite, spriteUrl } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { tone } from '../../engine/audio'
import type { GameProps } from '../../shell/games'
import { anim, flash } from '../shared/dom'
import { armPress } from '../shared/press'
import { random, rnd } from '../shared/random'
import { useGame } from '../shared/useGame'
import { AC, cfg as CFG } from './config'
import { spinAngle } from './logic'

function Wheel({ needleRef }: { needleRef: Ref<SVGGElement> }) {
  return (
    <svg width="170" height="170" viewBox="-60 -60 120 120" aria-hidden="true">
      <circle r="58" fill="#fff" />
      {AC.map((a, i) => {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / 3, a1 = a0 + (2 * Math.PI) / 3, m = (a0 + a1) / 2
        const x0 = 55 * Math.cos(a0), y0 = 55 * Math.sin(a0), x1 = 55 * Math.cos(a1), y1 = 55 * Math.sin(a1)
        return (
          <g key={a.id}>
            <path d={`M0 0 L${x0.toFixed(1)} ${y0.toFixed(1)} A55 55 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`} fill={a.c} stroke="#fff" strokeWidth="2" />
            <image href={spriteUrl(a.img)} x={(32 * Math.cos(m) - 11).toFixed(1)} y={(32 * Math.sin(m) - 13).toFixed(1)} width="22" height="26" />
          </g>
        )
      })}
      <g ref={needleRef} style={{ transition: 'transform 1.4s cubic-bezier(.2,.8,.3,1)' }}>
        <path d="M0 -46 L8 0 L-8 0 Z" fill="#5E4A3A" stroke="#5E4A3A" strokeWidth="2" strokeLinejoin="round" />
        <circle r="8" fill="#5E4A3A" />
      </g>
    </svg>
  )
}

/** Original squirrelGame (index.html:374): spin the wheel, pick the matching acorn for the log. */
export default function Game(props: GameProps) {
  const per = CFG[props.settings.age || 3]
  const [got, setGot] = useState<string[]>([])
  const logBox = useRef<HTMLDivElement>(null)
  const sqr = useRef<HTMLDivElement>(null)
  const spin = useRef<HTMLButtonElement>(null)
  const spinLabel = useRef<HTMLSpanElement>(null)
  const needle = useRef<SVGGElement>(null)
  const btns = useRef<(HTMLButtonElement | null)[]>([])

  useGame(props, g => {
    const { engine, say, later } = g
    const need: Record<string, number> = {}
    AC.forEach(a => { need[a.id] = per })
    const gotList: string[] = []
    let angle = 0

    function turn() {
      say('돌림판을 돌려 봐!')
      armPress(engine, spin.current, spinLabel.current, () => {
        engine.sfx.roll()
        const avail = AC.map((_, i) => i).filter(i => need[AC[i].id] > 0)
        const r = avail[rnd(avail.length)]
        angle = spinAngle(angle, r)
        if (needle.current) needle.current.style.transform = `rotate(${angle}deg)`
        later(() => { const a = AC[r]; say(a.name + ' 도토리!'); later(() => pick(a), 900) }, 1500)
      })
    }
    function pick(a: (typeof AC)[number]) {
      engine.choose(btns.current, k => {
        const b = AC[k]
        btns.current.forEach(x => x?.classList.remove('picked'))
        if (b.id === a.id) {
          need[a.id]--
          gotList.push(a.id)
          g.commit(() => setGot(gotList.slice()))
          engine.sfx.good()
          flash(logBox.current, 'pop')
          say('도토리 쏙!')
          if (Object.values(need).every(v => v === 0)) later(() => { happySquirrel(); later(() => g.finish('도토리를 다 모았어!'), 2200) }, 700)
          else later(turn, 1200)
        } else {
          engine.sfx.soft()
          flash(btns.current[k], 'nope')
          say('이건 ' + b.name + ' 도토리야.')
          later(() => pick(a), 1500)
        }
      })
    }
    function happySquirrel() {
      const q = sqr.current
      if (!q) return
      say('와, 신난다!')
      tone([520, 660, 780, 1040], 0.1, 'triangle', 0.08)
      anim(q, [
        { transform: 'translateY(0) scale(1,1)' },
        { transform: 'translateY(4px) scale(1.12,.86)', offset: 0.12 },
        { transform: 'translateY(-60px) scale(.94,1.08) rotate(-8deg)', offset: 0.3 },
        { transform: 'translateY(0) scale(1.1,.9)', offset: 0.45 },
        { transform: 'translateY(-48px) scale(.95,1.06) rotate(8deg)', offset: 0.65 },
        { transform: 'translateY(0) scale(1.08,.92)', offset: 0.8 },
        { transform: 'translateY(0) scale(1,1)' },
      ], { duration: 1600, easing: 'ease-in-out' })
      // Floating hearts: short-lived decoration appended into the squirrel box, as in the original.
      for (let k = 0; k < 6; k++) {
        const h = document.createElement('div')
        h.textContent = '❤'
        h.setAttribute('aria-hidden', 'true')
        h.style.cssText = `position:absolute;left:${30 + random() * 90}px;top:20px;font-size:${26 + random() * 16}px;color:${['#F2547A', '#FF8FA8', '#F04A3E'][k % 3]};pointer-events:none;z-index:6`
        q.appendChild(h)
        anim(h, [
          { transform: 'translate(0,0) scale(.3)', opacity: 0 },
          { transform: `translate(${(random() - 0.5) * 80}px,-40px) scale(1)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${(random() - 0.5) * 140}px,-140px) scale(.9)`, opacity: 0 },
        ], { duration: 1500, delay: k * 150, easing: 'ease-out', fill: 'both' })
        g.timeout(() => h.remove(), 1500 + k * 150 + 50)
      }
    }
    turn()
  })

  return (
    <Screen>
      <div className="row" style={{ gap: 20, alignItems: 'flex-end' }}>
        <div ref={logBox} style={{ background: '#B98552', borderRadius: 40, padding: '14px 24px', display: 'flex', gap: 10, border: '5px solid #8A5A34' }}>
          {Array.from({ length: per * AC.length }, (_, i) => (
            <div key={i} style={{ width: 58, height: 70, borderRadius: 14, background: '#F3E3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {got[i] && <Sprite name={AC.find(a => a.id === got[i])!.img} size={52} />}
            </div>
          ))}
        </div>
        <div ref={sqr} style={{ position: 'relative' }}><Sprite name="squirrel" size={150} alt="다람쥐" /></div>
      </div>
      <div className="row" style={{ gap: 'calc(var(--vw)*5)' }}>
        <div className="row">
          {AC.map((a, i) => (
            <TapButton key={a.id} ref={el => { btns.current[i] = el }} label={a.name + ' 도토리'} style={{ width: 'clamp(120px,calc(var(--vw)*14),150px)', height: 'clamp(140px,calc(var(--vh)*22),180px)' }}>
              <Sprite name={a.img} size={110} alt={a.name + ' 도토리'} />
            </TapButton>
          ))}
        </div>
        <PressButton label="돌림판 돌리기" btnRef={spin} labelRef={spinLabel} labelSize={24} style={{ width: 190, height: 190, borderRadius: '50%', padding: 6, borderWidth: 5 }}>
          <Wheel needleRef={needle} />
        </PressButton>
      </div>
    </Screen>
  )
}
