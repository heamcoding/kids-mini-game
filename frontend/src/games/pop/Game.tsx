import { useRef, useState } from 'react'
import { Screen } from '../../components/Screen'
import { spriteUrl } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { tone } from '../../engine/audio'
import { getScale } from '../../engine/fit'
import { confetti } from '../../shell/confetti'
import type { GameProps } from '../../shell/games'
import { anim } from '../shared/dom'
import { useGame } from '../shared/useGame'
import { HOLES, STC, STEP, TOTALS } from './config'
import { ease, emptyHoles, hasEmptyElsewhere, makeFilled, nextFace, pickBoom, scene, type Filled, type Geom, type PopAnim, type View } from './logic'

/** Original endOn(i): the stick seen end-on (a pill-shaped cap). */
function EndOn({ i }: { i: number }) {
  const [c, d, l] = STC[i]
  return (
    <svg width="100%" height="100%" viewBox="0 0 60 96" preserveAspectRatio="none" aria-hidden="true">
      <rect x="6" y="3" width="48" height="70" rx="24" fill={c} stroke={d} strokeWidth="4" />
      <rect x="14" y="14" width="7" height="30" rx="3.5" fill="#fff" opacity=".5" />
      <ellipse cx="30" cy="68" rx="26" ry="25" fill={c} stroke={d} strokeWidth="4" />
      <ellipse cx="30" cy="66" rx="18" ry="17" fill={l} opacity=".55" />
      <ellipse cx="23" cy="58" rx="5" ry="3.5" fill="#fff" opacity=".8" />
    </svg>
  )
}

/** Original stickURI(i): the stick seen from the side as a data URI. */
function stickURI(i: number): string {
  const [c, d] = STC[i]
  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 100"><rect x="2.5" y="2.5" width="27" height="95" rx="13.5" fill="${c}" stroke="${d}" stroke-width="3.5"/><rect x="8" y="12" width="6" height="60" rx="3" fill="#fff" opacity=".55"/><ellipse cx="13" cy="9" rx="5" ry="3" fill="#fff" opacity=".8"/></svg>`)
}

/** Original popGame (index.html:404): fill the barrel's holes with sticks until the rabbit pops out. */
export default function Game(props: GameProps) {
  const total = TOTALS[props.settings.age || 3]
  const faces = total / 3
  const [geom] = useState<Geom>(() => {
    const DW = innerWidth / getScale(), DH = innerHeight / getScale()
    const W = Math.round(Math.min(480, DW * 0.5, (DH * 0.62 * 800) / 749))
    return { W, H: Math.round((W * 749) / 800), D: W * 0.178 }
  })
  const { W, H, D } = geom
  const [view, setView] = useState<View>(() => ({ face: 0, filled: makeFilled(faces), phi: 0, nextF: null, anim: null }))
  const [canTurn, setCanTurn] = useState(true)
  const bw = useRef<HTMLDivElement>(null)
  const turnBtn = useRef<HTMLButtonElement>(null)
  const holeBtns = useRef<(HTMLButtonElement | null)[]>([])

  useGame(props, g => {
    const { engine, say, later } = g
    const boom = pickBoom(total)
    let face = 0, n = 0
    const filled: Filled = makeFilled(faces)
    let ins: PopAnim | null = null

    const render = (phi: number, nextF: number | null = null) =>
      g.commit(() => setView({ face, filled: filled.map(f => f.slice()), phi, nextF, anim: ins ? { ...ins } : null }))

    function tween(ms: number, fn: (p: number) => void, done: () => void) {
      const t0 = performance.now()
      const step = () => {
        const p = Math.min(1, (performance.now() - t0) / ms)
        fn(ease(p))
        if (p < 1) g.timeout(step, 16)
        else done()
      }
      g.timeout(step, 0)
    }
    function rotate(cb: () => void) {
      const nf = nextFace(filled, face)
      engine.sfx.roll()
      tween(900, p => render(p * STEP, nf), () => { face = nf; render(0); cb() })
    }
    function insert(j: number, cb: () => void) {
      const col = n % STC.length
      ins = { f: face, j, col, p: 0 }
      tween(380, p => { ins!.p = p; render(0) }, () => { ins = null; filled[face][j] = col; n++; render(0); cb() })
    }
    function turn() {
      const empty = emptyHoles(filled, face)
      const opts: (HTMLButtonElement | null)[] = empty.map(i => holeBtns.current[i])
      const can = hasEmptyElsewhere(filled, face)
      if (can) opts.push(turnBtn.current)
      g.commit(() => setCanTurn(can))
      say(n === 0 ? '구멍에 막대를 꽂아 봐! 통을 돌리면 다른 구멍도 나와.' : empty.length ? '어디에 꽂을까?' : '이쪽은 꽉 찼어! 통을 돌려 볼까?')
      engine.choose(opts, k => {
        const b = opts[k]
        b?.classList.remove('picked')
        if (b === turnBtn.current) { rotate(() => later(turn, 200)); return }
        const i = holeBtns.current.indexOf(b)
        engine.sfx.tap()
        insert(i, () => {
          tone([180], 0.08, 'square')
          const gi = face * 3 + i
          if (gi === boom) popOut()
          else { engine.speak(['쏙!', '휴, 아직!', '두근두근!'][n % 3]); later(turn, 800) }
        })
      })
    }
    function popOut() {
      anim(bw.current, [{ transform: 'rotate(0)' }, { transform: 'rotate(-4deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' }], { duration: 500 })
      tone([300, 350, 400], 0.08, 'square', 0.07)
      later(() => {
        const SC = getScale()
        const r = bw.current!.getBoundingClientRect()
        const sx = r.left + r.width * 0.503, sy = r.top + r.height * 0.135
        const sz = Math.min(innerWidth, innerHeight) * 0.48
        const k0 = (80 * SC) / sz
        const bun = g.overlay(document.createElement('img'))
        bun.src = spriteUrl('bigrabbit')
        bun.alt = '토끼'
        bun.style.cssText = `position:fixed;left:${sx - sz / 2}px;top:${sy - sz / 2}px;width:${sz}px;height:${sz}px;object-fit:contain;z-index:45;pointer-events:none;transform:scale(${k0 * 0.3})`
        const dx = innerWidth / 2 - sx, dy = innerHeight / 2 - sy
        anim(bun, [
          { transform: `translate(0,40px) scale(${k0 * 0.3})`, opacity: 0.2 },
          { transform: `translate(0,${-140 * SC}px) scale(${k0 * 1.4})`, opacity: 1, offset: 0.35 },
          { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 1 },
        ], { duration: 1100, easing: 'cubic-bezier(.3,1.3,.5,1)', fill: 'forwards' })
        tone([392, 523, 659, 1047], 0.2, 'triangle', 0.08)
        say('짠! 토끼가 튀어나왔다!')
        later(confetti, 700)
        later(() => { bun.remove(); g.finish('토끼를 찾았어!') }, 3200)
        g.timeout(() => bun.remove(), 6000)
      }, 550)
    }
    turn()
  })

  const { holes, sticks } = scene(view, geom, STEP)
  const resting = view.nextF != null
  return (
    <Screen>
      <div className="row" style={{ gap: 'calc(var(--vw)*4)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div ref={bw} style={{ position: 'relative', width: W, height: H }}>
            <img src={spriteUrl('barrel_blank')} alt="통" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {holes.map(h => (
                <div key={h.key} style={{ position: 'absolute', left: h.left, top: h.top, width: h.width, height: h.height, borderRadius: '50%', background: 'radial-gradient(ellipse at 50% 45%,#2E1A0C 55%,#4A2E18 70%,#F8C88A 74%,#F2B36C 100%)', opacity: h.opacity }} />
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {sticks.map(s => s.kind === 'end' ? (
                <div key={s.key} style={{ position: 'absolute', left: s.left, top: s.top, width: s.width, height: s.height, opacity: s.opacity }}><EndOn i={s.col} /></div>
              ) : (
                <img key={s.key} src={stickURI(s.col)} alt="" draggable={false} style={{ position: 'absolute', left: s.left, top: s.top, width: s.width, height: s.height, transform: `rotate(${s.rot}deg)`, opacity: s.opacity }} />
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0 }}>
              {HOLES.map(([x, y], i) => (
                <TapButton
                  key={i}
                  ref={el => { holeBtns.current[i] = el }}
                  label={i + 1 + '번 구멍'}
                  disabled={resting || view.filled[view.face][i] != null}
                  style={{ position: 'absolute', left: x * W - D / 2, top: y * H - D / 2, width: D, height: D, minWidth: 0, minHeight: 0, padding: 0, borderRadius: '50%', background: 'transparent', borderColor: 'transparent', visibility: resting ? 'hidden' : 'visible' }}
                />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {view.filled.map((_, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i === view.face ? '#2F6FB5' : '#D9CFBF' }} />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <TapButton ref={turnBtn} label="통 돌리기" style={{ width: 150, height: 150, borderRadius: '50%', padding: 0, opacity: canTurn ? 1 : 0.35 }}>
            <div style={{ position: 'relative', width: 120, height: 110 }}>
              <img src={spriteUrl('barrel_blank')} alt="" draggable={false} style={{ objectFit: 'contain', pointerEvents: 'none', width: 80, height: 75, position: 'absolute', left: 20, top: 22 }} />
              <svg width="120" height="110" viewBox="0 0 120 110" style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
                <path d="M104 66 A48 22 0 0 1 22 82" fill="none" stroke="#2F6FB5" strokeWidth="7" strokeLinecap="round" />
                <path d="M8 78 L28 70 L26 92 Z" fill="#2F6FB5" stroke="#2F6FB5" strokeWidth="3" strokeLinejoin="round" />
                <path d="M18 40 A48 22 0 0 1 98 26" fill="none" stroke="#2F6FB5" strokeWidth="7" strokeLinecap="round" opacity=".35" />
              </svg>
            </div>
          </TapButton>
          <span className="jua" style={{ fontSize: 24, color: '#1F4F85', minHeight: 34 }}>통 돌리기</span>
        </div>
      </div>
    </Screen>
  )
}
