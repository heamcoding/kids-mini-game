import { useRef, useState, type CSSProperties } from 'react'
import { COLS, ColorTile, type Col } from '../../components/ColorTile'
import { PressButton } from '../../components/PressButton'
import { Screen } from '../../components/Screen'
import { Sprite } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { getScale } from '../../engine/fit'
import type { GameProps } from '../../shell/games'
import { anim, flash } from '../shared/dom'
import { armPress } from '../shared/press'
import { random, rnd, shuffle } from '../shared/random'
import { useGame } from '../shared/useGame'
import { cfg as CFG, SUN_P } from './config'
import { aheadColors, judgePick } from './logic'

type Face = { kind: 'back' } | { kind: 'sun' } | { kind: 'col'; col: Col }

const STAR_PATH = 'M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10 Z'

function makeStars() {
  const dots = Array.from({ length: 55 }, () => {
    const sz = 2 + random() * 4
    return { left: random() * 100, top: random() * 62, sz, delay: (random() * 3).toFixed(2), dur: (2 + random() * 2).toFixed(2) }
  })
  const sparkles = Array.from({ length: 7 }, () => ({ z: 14 + rnd(10), left: 10 + random() * 80, top: 4 + random() * 45, delay: (random() * 3).toFixed(2) }))
  return { dots, sparkles }
}

const OWL_SKY: CSSProperties = { position: 'absolute', zIndex: 6, pointerEvents: 'none', width: 80, height: 80 }
const OWL_NEST: CSSProperties = { position: 'absolute', left: '50%', bottom: 'calc(62% + 50px)', transform: 'translateX(-50%)', zIndex: 3, pointerEvents: 'none', width: 80, height: 80 }

/** Original owlGame (index.html:334): flip colour cards to hop the owl to its nest before the sun rises. */
export default function Game(props: GameProps) {
  const c = CFG[props.settings.age || 3]
  const [{ cols, seq }] = useState(() => {
    const cols = shuffle(COLS.slice(0, c.colors))
    return { cols, seq: Array.from({ length: c.len }, (_, i) => cols[i % cols.length]) }
  })
  const [stars] = useState(makeStars)
  const [face, setFace] = useState<Face>({ kind: 'back' })
  const [atNest, setAtNest] = useState(false)
  const sky = useRef<HTMLDivElement>(null)
  const moon = useRef<HTMLDivElement>(null)
  const sunEl = useRef<HTMLDivElement>(null)
  const startCell = useRef<HTMLDivElement>(null)
  const cells = useRef<(HTMLButtonElement | null)[]>([])
  const nest = useRef<HTMLDivElement>(null)
  const owl = useRef<HTMLDivElement>(null)
  const card = useRef<HTMLButtonElement>(null)
  const cardLabel = useRef<HTMLSpanElement>(null)

  useGame(props, g => {
    const { engine, say, later } = g
    let pos = -1
    let sun = 0
    const last = c.len - 1

    function spot(p: number) {
      const SC = getScale()
      const sr = sky.current!.getBoundingClientRect()
      const r = (p < 0 ? startCell.current! : cells.current[p]!).getBoundingClientRect()
      return { x: (r.left - sr.left + r.width / 2) / SC - 40, y: p < 0 ? (r.bottom - sr.top) / SC - 80 : (r.top - sr.top) / SC - 62 }
    }
    function place(from?: { x: number; y: number }) {
      if (pos === last) {
        // Owl moves into the nest cell and sits down.
        if (nest.current) nest.current.style.zIndex = '2'
        g.commit(() => setAtNest(true))
        flash(owl.current, 'pop')
        return
      }
      const t = spot(pos)
      const o = owl.current
      if (!o) return
      o.style.left = t.x + 'px'
      o.style.top = t.y + 'px'
      if (from) {
        const dx = from.x - t.x, dy = from.y - t.y
        anim(o, [{ transform: `translate(${dx}px,${dy}px)` }, { transform: `translate(${dx / 2}px,${dy / 2 - 70}px)`, offset: 0.5 }, { transform: 'translate(0,0)' }], { duration: 650, easing: 'ease-in-out' })
      }
    }
    function drawMoon() {
      const s = sky.current, m = moon.current
      if (!s || !m) return
      const W = s.clientWidth || 1000, H = s.clientHeight || 400
      const p = sun / c.sun
      const th = ((125 + p * 100) * Math.PI) / 180
      const R = H * 0.98
      const x = W * 0.35 + R * Math.cos(th), y = H - R * Math.sin(th)
      m.style.left = x - 50 + 'px'
      m.style.top = y - 50 + 'px'
      m.style.opacity = String(Math.max(0, 1 - p * 0.6))
    }
    function drawSun() {
      drawMoon()
      if (sunEl.current) sunEl.current.style.bottom = -80 + sun * (260 / c.sun) + 'px'
    }
    place()
    drawSun()

    function flip() {
      g.commit(() => setFace({ kind: 'back' }))
      say('카드를 뒤집어 봐!')
      armPress(engine, card.current, cardLabel.current, () => {
        engine.sfx.flip()
        if (random() < SUN_P) {
          g.commit(() => setFace({ kind: 'sun' }))
          sun++
          drawSun()
          if (sun >= c.sun) { say('해가 떴어! 부엉이도 이제 자러 가자.'); later(() => g.finish('부엉이랑 잘 놀았어!'), 2400); return }
          say('해 카드! 해가 조금 올라왔어.')
          later(flip, 1800)
          return
        }
        const ac = aheadColors(cols, seq, pos)
        const col = ac[rnd(ac.length)]
        g.commit(() => setFace({ kind: 'col', col }))
        say(col.name + ' ' + col.mname + '!')
        const ahead: number[] = []
        for (let i = pos + 1; i < c.len; i++) ahead.push(i)
        later(() => pick(col, ahead), 1000)
      })
    }
    function pick(col: Col, ahead: number[]) {
      say(col.name + ' 칸을 찾아 봐!')
      engine.choose(ahead.map(i => cells.current[i]), k => {
        const i = ahead[k]
        cells.current.forEach(x => x?.classList.remove('picked'))
        const r = judgePick(seq, pos, i, col.id)
        if (r === 'ok') {
          const fr = spot(pos)
          pos = i
          place(fr)
          engine.sfx.good()
          if (pos === last) { say('둥지에 도착!'); later(() => g.finish('부엉이가 둥지에 도착했어!'), 1500) }
          else { say('훨훨!'); later(flip, 1100) }
        } else if (r === 'far') {
          engine.sfx.soft()
          flash(cells.current[i], 'nope')
          say('그건 너무 멀리 있어. 가까이 있는 거 찾아 줘!')
          later(() => pick(col, ahead), 1600)
        } else {
          engine.sfx.soft()
          flash(cells.current[i], 'nope')
          say('이건 ' + seq[i].name + ' 칸이야.')
          later(() => pick(col, ahead), 1400)
        }
      })
    }
    flip()
  })

  const owlEl = (
    <div ref={owl} style={atNest ? OWL_NEST : OWL_SKY}>
      <Sprite name={atNest ? 'owl_sit' : 'owl'} size={80} alt="부엉이" />
    </div>
  )

  return (
    <Screen>
      <div ref={sky} style={{ position: 'relative', width: 'min(calc(var(--vw)*92),1150px)', height: 'calc(var(--vh)*46)', flexShrink: 0, borderRadius: 28, background: 'linear-gradient(#1B2448,#2E3A6B 70%,#6B5B8E)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {stars.dots.map((s, i) => (
            <span key={i} className="twinkle" style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, width: s.sz, height: s.sz, borderRadius: '50%', background: '#FFF6C9', boxShadow: `0 0 ${s.sz * 1.5}px rgba(255,241,184,.7)`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
          ))}
          {stars.sparkles.map((s, i) => (
            <span key={'s' + i} className="twinkle" style={{ position: 'absolute', left: `${s.left}%`, top: `${s.top}%`, width: s.z, height: s.z, filter: 'drop-shadow(0 0 6px rgba(255,241,184,.8))', animationDelay: `${s.delay}s` }}>
              <svg width={s.z} height={s.z} viewBox="-10 -10 20 20" aria-hidden="true"><path d={STAR_PATH} fill="#FFF3C4" /></svg>
            </span>
          ))}
        </div>
        <div ref={moon} style={{ position: 'absolute', left: 0, top: 0, width: 100, height: 100, transition: 'left 1s,top 1s,opacity 1s', zIndex: 1, filter: 'drop-shadow(0 0 18px rgba(255,241,184,.75))' }}>
          <svg width="100" height="100" viewBox="0 0 100 100" role="img" aria-label="달">
            <defs><mask id="moonCut"><rect width="100" height="100" fill="#fff" /><circle cx="66" cy="38" r="34" fill="#000" /></mask></defs>
            <circle cx="50" cy="50" r="38" fill="#FFF1B8" mask="url(#moonCut)" />
          </svg>
        </div>
        <div ref={sunEl} style={{ position: 'absolute', right: 16, width: 90, height: 90, borderRadius: '50%', background: '#F4C431', boxShadow: '0 0 50px 20px rgba(244,169,78,.6)', transition: 'bottom .8s' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, background: '#2A3A2E' }} />
        <div style={{ position: 'absolute', left: 16, right: 96, bottom: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
          <div ref={startCell} style={{ width: 80, flexShrink: 0, display: 'flex', justifyContent: 'center' }} />
          {seq.map((col, i) => (
            <TapButton key={i} ref={el => { cells.current[i] = el }} label={col.name + ' 칸'} style={{ width: '100%', maxWidth: 84, aspectRatio: '1', flex: 1, padding: 0, minWidth: 44, minHeight: 44, borderColor: 'transparent', background: 'transparent', marginBottom: Math.round(i * Math.min(16, 120 / c.len)), position: 'relative', overflow: 'visible' }}>
              <ColorTile col={col} size="100%" />
              {i === c.len - 1 && (
                <>
                  <div ref={nest} style={{ position: 'absolute', left: '50%', bottom: '62%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                    <Sprite name="nest" size={100} alt="둥지" />
                  </div>
                  {atNest && owlEl}
                </>
              )}
            </TapButton>
          ))}
        </div>
        {!atNest && owlEl}
      </div>
      <PressButton
        label="카드 뒤집기"
        btnRef={card}
        labelRef={cardLabel}
        style={{ width: 112, height: 130, borderWidth: 5, background: face.kind === 'back' ? '#2E3A6B' : '#fff' }}
        wrapStyle={{ gap: 'calc(var(--vh)*2.2)', marginTop: 'calc(var(--vh)*4)' }}
      >
        {face.kind === 'back' && (
          <span style={{ display: 'inline-flex', filter: 'drop-shadow(0 0 10px rgba(255,241,184,.75))' }}>
            <svg width="64" height="64" viewBox="0 0 100 100" role="img" aria-label="카드 뒷면">
              <defs><mask id="cardMoonCut"><rect width="100" height="100" fill="#fff" /><circle cx="66" cy="38" r="34" fill="#000" /></mask></defs>
              <circle cx="50" cy="50" r="38" fill="#FFF1B8" mask="url(#cardMoonCut)" />
            </svg>
          </span>
        )}
        {face.kind === 'sun' && <span style={{ display: 'block', width: 90, height: 90, borderRadius: '50%', background: '#F4C431', boxShadow: '0 0 20px 6px rgba(244,169,78,.6)' }} />}
        {face.kind === 'col' && <ColorTile col={face.col} size={84} />}
      </PressButton>
    </Screen>
  )
}
