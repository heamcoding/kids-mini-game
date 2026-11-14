import { useRef, useState } from 'react'
import { DiceFace } from '../../components/DiceFace'
import { PressButton } from '../../components/PressButton'
import { Screen } from '../../components/Screen'
import { Sprite, spriteUrl } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { tone } from '../../engine/audio'
import { KNUM } from '../../engine/korean'
import type { GameProps } from '../../shell/games'
import { attn, flash } from '../shared/dom'
import { armPress } from '../shared/press'
import { rnd } from '../shared/random'
import { useGame } from '../shared/useGame'
import { cfg as CFG } from './config'
import { dieTop, leftDet, plateItems } from './logic'

const candy = (c: string, size: number) => (
  <img src={spriteUrl('candy_' + c)} alt="" draggable={false} style={{ width: size, height: Math.round(size * 0.55), objectFit: 'contain', pointerEvents: 'none' }} />
)

/** Original bearGame (index.html:470): roll the die and feed the bear that many candies. */
export default function Game(props: GameProps) {
  const cfg = CFG[props.settings.age || 3]
  const [items, setItems] = useState<string[]>(() => plateItems(cfg.snacks))
  const [dieN, setDieN] = useState<number | null>(null)
  const [happy, setHappy] = useState(false)
  const die = useRef<HTMLButtonElement>(null)
  const dl = useRef<HTMLSpanElement>(null)
  const plate = useRef<HTMLButtonElement>(null)
  const bearImg = useRef<HTMLDivElement>(null)
  const yum = useRef<HTMLSpanElement>(null)
  const tapped = useRef<HTMLElement | null>(null)

  useGame(props, g => {
    const { engine, say, later } = g
    let left = cfg.snacks
    const list = plateItems(cfg.snacks)
    let happyTok = 0

    function roll() {
      g.commit(() => setDieN(null))
      say('주사위를 눌러 봐!')
      armPress(engine, die.current, dl.current, () => {
        engine.sfx.roll()
        let c = 0
        const top = dieTop(cfg.max, left)
        const stop = g.interval(() => {
          g.commit(() => setDieN(1 + rnd(top)))
          if (++c > 7) {
            stop()
            const n = 1 + rnd(top)
            g.commit(() => setDieN(n))
            flash(die.current, 'pop')
            say(left === n && n < cfg.max ? KNUM[n] + '! 마지막 사탕이야!' : KNUM[n] + '!')
            later(() => feed(n, 0), 900)
          }
        }, 80)
      })
    }

    function feed(n: number, i: number) {
      if (i >= n) {
        if (left <= 0) later(() => g.finish('곰돌이가 사탕을 다 먹었어!'), 900)
        else { say('냠냠! 사탕이 ' + leftDet(left) + ' 개 남았어.'); later(roll, 900) }
        return
      }
      const p = plate.current
      attn(p, true)
      if (dl.current) dl.current.textContent = n - i + '개 더!'
      engine.choose([p], () => {
        attn(p, false)
        p?.classList.remove('picked')
        const all = p ? [...p.querySelectorAll<HTMLElement>('.cdy')] : []
        const t = tapped.current
        const src = t && p?.contains(t) ? t : all[all.length - 1]
        tapped.current = null
        const idx = src ? +src.dataset.i! : list.length - 1
        const bi = bearImg.current
        if (src && bi) {
          const r1 = src.getBoundingClientRect(), r2 = bi.getBoundingClientRect()
          const c = g.overlay(src.cloneNode(true) as HTMLElement)
          c.style.cssText = `position:fixed;left:${r1.left}px;top:${r1.top}px;z-index:40;pointer-events:none;transition:all .55s cubic-bezier(.4,-0.3,.6,1)`
          src.style.visibility = 'hidden'
          g.raf(() => {
            c.style.left = r2.left + r2.width / 2 - r1.width / 2 + 'px'
            c.style.top = r2.top + r2.height * 0.62 - r1.height / 2 + 'px'
            c.style.transform = 'scale(.4) rotate(200deg)'
            c.style.opacity = '.6'
          })
          g.timeout(() => c.remove(), 600)
        }
        g.timeout(() => {
          left--
          list.splice(idx, 1)
          g.commit(() => { setItems(list.slice()); setHappy(true) })
          flash(bi, 'chomp')
          const tok = ++happyTok
          g.timeout(() => { if (tok === happyTok) g.commit(() => setHappy(false)) }, 900)
          const y = yum.current
          if (y) { y.style.opacity = '1'; g.timeout(() => { y.style.opacity = '0' }, 500) }
          tone([300, 240], 0.09, 'square', 0.1)
        }, 560)
        engine.speak(KNUM[i + 1])
        later(() => feed(n, i + 1), 1000)
      })
    }
    roll()
  })

  return (
    <Screen>
      <div className="row" style={{ gap: 'calc(var(--vw)*5)', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div ref={bearImg} style={{ transformOrigin: '50% 100%' }}><Sprite name={happy ? 'bear_happy' : 'bear'} size={210} alt="곰돌이" /></div>
          <span ref={yum} className="jua" style={{ position: 'absolute', top: -10, right: -30, fontSize: 34, color: '#E35D4B', opacity: 0, transition: 'opacity .2s' }}>냠!</span>
          <span className="jua" style={{ fontSize: 22 }}>사탕 좋아 곰돌이</span>
        </div>
        <PressButton label="주사위 굴리기" btnRef={die} labelRef={dl} style={{ width: 160, height: 160, borderWidth: 5 }} wrapStyle={{ gap: 26 }} labelSize={24}>
          {dieN === null ? <Sprite name="die" size={110} alt="주사위" /> : <DiceFace n={dieN} size={120} />}
        </PressButton>
        <TapButton
          ref={plate}
          label="사탕 접시"
          onPointerDown={e => { tapped.current = (e.target as HTMLElement).closest<HTMLElement>('.cdy') }}
          style={{ width: 'clamp(230px,calc(var(--vw)*28),320px)', height: 'clamp(170px,calc(var(--vh)*26),230px)', borderRadius: '50%', background: '#F6F1E7', flexDirection: 'row', flexWrap: 'wrap', gap: 2, padding: 20 }}
        >
          {items.map((c, i) => <span key={`${items.length}-${i}`} className="cdy" data-i={i} style={{ display: 'inline-flex' }}>{candy(c, 72)}</span>)}
        </TapButton>
      </div>
    </Screen>
  )
}
