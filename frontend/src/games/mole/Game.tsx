import { useRef, useState, type CSSProperties } from 'react'
import { Screen } from '../../components/Screen'
import { Sprite, spriteUrl } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { tone } from '../../engine/audio'
import { getScale } from '../../engine/fit'
import type { GameProps } from '../../shell/games'
import { anim } from '../shared/dom'
import { useGame } from '../shared/useGame'
import { cfg as CFG, TOTAL } from './config'
import { finishMessage, pickHole } from './logic'

/** Original hammerSVG(). */
function Hammer() {
  return (
    <svg width="120" height="120" viewBox="-60 -60 120 120" aria-hidden="true">
      <rect x="-6" y="-8" width="12" height="62" rx="5" fill="#C98B4A" stroke="#7A4A22" strokeWidth="2.5" />
      <rect x="-38" y="-34" width="76" height="34" rx="12" fill="#E35D4B" stroke="#8A2A1E" strokeWidth="2.5" />
      <rect x="-44" y="-38" width="12" height="42" rx="5" fill="#C9473A" stroke="#8A2A1E" strokeWidth="2.5" />
      <rect x="32" y="-38" width="12" height="42" rx="5" fill="#C9473A" stroke="#8A2A1E" strokeWidth="2.5" />
      <rect x="-26" y="-28" width="30" height="7" rx="3.5" fill="#fff" opacity=".45" />
    </svg>
  )
}

const HOLE_BTN: CSSProperties = { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, minWidth: 0, minHeight: 0 }
const MOLE_BOX: CSSProperties = { position: 'absolute', left: 0, right: 0, bottom: -12, display: 'flex', justifyContent: 'center', transform: 'translateY(110%)', transformOrigin: '50% 100%' }
const HAMMER_BOX: CSSProperties = { position: 'absolute', width: 120, height: 120, pointerEvents: 'none', opacity: 0, zIndex: 5, transformOrigin: '50% 90%' }

/** Original moleGame (index.html:492): tap the moles as they pop out of the holes. */
export default function Game(props: GameProps) {
  const age = props.settings.age || 3
  const cfg = CFG[age]
  const [hits, setHits] = useState(0)
  const field = useRef<HTMLDivElement>(null)
  const hammer = useRef<HTMLDivElement>(null)
  const btns = useRef<(HTMLButtonElement | null)[]>([])
  const moles = useRef<(HTMLDivElement | null)[]>([])

  useGame(props, g => {
    const { engine, say, later } = g
    let n = 0, shown = 0, last = -1
    // Original `timer`: the miss timer of the mole on screen; bumping the id cancels it.
    let missId = 0

    function setM(i: number, y: string, tr: string) {
      const m = moles.current[i]
      if (!m) return
      m.style.transition = tr
      m.style.transform = `translateY(${y})`
    }
    function smash(i: number) {
      const f = field.current, h = hammer.current, b = btns.current[i], m = moles.current[i]
      if (!f || !h || !b || !m) return
      const SC = getScale()
      const fr = f.getBoundingClientRect(), br = b.getBoundingClientRect()
      h.style.left = (br.left - fr.left + br.width / 2) / SC - 10 + 'px'
      h.style.top = (br.top - fr.top + br.height * 0.2) / SC - 90 + 'px'
      h.style.opacity = '1'
      anim(h, [{ transform: 'rotate(-55deg)' }, { transform: 'rotate(15deg)', offset: 0.45 }, { transform: 'rotate(5deg)', offset: 0.6 }, { transform: 'rotate(-30deg)' }], { duration: 420, easing: 'ease-in' })
      const mi = m.querySelector('img')
      g.timeout(() => {
        tone([160, 110], 0.09, 'square', 0.05)
        if (mi) mi.src = spriteUrl('mole_hurt')
        if (!m.querySelector('.burst')) {
          const bu = document.createElement('img')
          bu.className = 'burst'
          bu.src = spriteUrl('mole_burst')
          bu.alt = ''
          bu.draggable = false
          bu.style.cssText = 'position:absolute;left:50%;bottom:95px;width:92px;margin-left:-40px;pointer-events:none'
          m.appendChild(bu)
          anim(bu, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1, offset: 0.5 }, { transform: 'scale(1)', opacity: 1 }], 300)
        }
        anim(m, [
          { transform: 'translateY(0) rotate(0)' }, { transform: 'translateY(6px) rotate(-6deg)' }, { transform: 'translateY(4px) rotate(6deg)' },
          { transform: 'translateY(5px) rotate(-4deg)' }, { transform: 'translateY(4px) rotate(0)' },
        ], 450)
        m.style.transition = 'none'
        m.style.transform = 'translateY(4px)'
      }, 190)
      g.timeout(() => { h.style.opacity = '0' }, 430)
      g.timeout(() => setM(i, '110%', 'transform .45s ease-in'), 700)
      g.timeout(() => {
        if (mi) mi.src = spriteUrl('mole')
        m.querySelector('.burst')?.remove()
      }, 1200)
    }
    function up() {
      if (shown >= TOTAL) {
        const msg = finishMessage(n, TOTAL)
        later(() => g.finish(msg), 600)
        return
      }
      const i = pickHole(last, cfg.holes)
      last = i
      shown++
      setM(i, '0', 'transform .35s cubic-bezier(.3,1.4,.5,1)')
      engine.choose([btns.current[i]], () => {
        missId++
        n++
        g.commit(() => setHits(n))
        smash(i)
        engine.speak(['아야!', '아이쿠!', '앗 따가!'][n % 3])
        later(up, 1500)
      })
      if (cfg.stay) {
        const t = engine.scheduler.token()
        const id = ++missId
        g.timeout(() => {
          if (id !== missId || t !== engine.scheduler.token() || engine.isSettingsOpen()) return
          engine.stopChoose()
          setM(i, '110%', 'transform .35s ease-in')
          engine.speak('쏙 숨었다!')
          later(up, 900)
        }, cfg.stay * 1000)
      }
    }
    say('두더지가 나오면 톡 눌러 봐!')
    later(up, 1500)
  })

  return (
    <Screen>
      <div style={{ display: 'flex', gap: 6, background: '#F6F1E7', borderRadius: 999, padding: '6px 16px' }}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <span key={i} style={{ opacity: i < hits ? 1 : 0.25, display: 'inline-flex' }}>
            <Sprite name="mole" size={34} alt={i < hits ? '잡은 두더지' : ''} />
          </span>
        ))}
      </div>
      <div
        ref={field}
        style={{ position: 'relative', background: '#9CCB86', borderRadius: 32, padding: '24px 36px', display: 'grid', gridTemplateColumns: `repeat(${cfg.cols},minmax(0,1fr))`, gap: '12px 36px', boxShadow: 'inset 0 -10px 0 #86B872' }}
      >
        {Array.from({ length: cfg.holes }, (_, i) => (
          <TapButton key={i} ref={el => { btns.current[i] = el }} className="plain" label={i + 1 + '번 구멍'} style={HOLE_BTN}>
            <div style={{ position: 'relative', width: 150, height: cfg.holes > 3 ? 150 : 170 }}>
              <svg width="150" height="60" viewBox="0 0 150 60" style={{ position: 'absolute', left: 0, bottom: 6 }} aria-hidden="true">
                <ellipse cx="75" cy="30" rx="70" ry="24" fill="#B98552" />
                <ellipse cx="75" cy="27" rx="58" ry="17" fill="#3B2A1A" />
              </svg>
              <div style={{ position: 'absolute', left: 5, right: 5, bottom: 33, height: 150, overflow: 'hidden' }}>
                <div ref={el => { moles.current[i] = el }} className="mm" style={MOLE_BOX}>
                  <Sprite name="mole" size={128} alt="두더지" />
                </div>
              </div>
              <svg width="150" height="30" viewBox="0 0 150 30" style={{ position: 'absolute', left: 0, bottom: 6 }} aria-hidden="true">
                <path d="M5 0 A70 24 0 0 0 145 0 L145 6 A70 24 0 0 1 5 6 Z" fill="#B98552" />
              </svg>
            </div>
          </TapButton>
        ))}
        <div ref={hammer} style={HAMMER_BOX}><Hammer /></div>
      </div>
    </Screen>
  )
}
