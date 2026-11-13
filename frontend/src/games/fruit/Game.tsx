import { useRef, useState, type MouseEvent, type Ref } from 'react'
import { PressButton } from '../../components/PressButton'
import { Screen } from '../../components/Screen'
import { Sprite, spriteUrl } from '../../components/Sprite'
import { TapButton } from '../../components/TapButton'
import { tone } from '../../engine/audio'
import { getScale } from '../../engine/fit'
import { eul, iya } from '../../engine/korean'
import { confetti } from '../../shell/confetti'
import type { GameProps } from '../../shell/games'
import { anim, center, flash } from '../shared/dom'
import { armPress } from '../shared/press'
import { rnd } from '../shared/random'
import { useGame } from '../shared/useGame'
import { cfg as CFG, FRUITS, RAVEN_WINS_P, type FruitKind } from './config'
import { makePlan, nextFace } from './logic'

type Pt = { x: number; y: number }

/** Original treeSVG(w): the goal tree at the end of the raven's path. */
function Tree({ w, svgRef }: { w: number; svgRef?: Ref<SVGSVGElement> }) {
  return (
    <svg ref={svgRef} width={w} height={w} viewBox="-30 -34 60 64" aria-hidden="true">
      <rect x="-5" y="4" width="10" height="24" rx="3" fill="#B98552" />
      <circle cx="0" cy="-10" r="22" fill="#7DBB5C" />
      <circle cx="-14" cy="0" r="12" fill="#7DBB5C" />
      <circle cx="14" cy="0" r="12" fill="#7DBB5C" />
      <circle cx="-8" cy="-14" r="4.5" fill="#E35D4B" />
      <circle cx="8" cy="-6" r="4.5" fill="#F4C431" />
      <circle cx="-2" cy="2" r="4.5" fill="#7B5BA6" />
    </svg>
  )
}

const faceImg = (f: FruitKind | 'raven') => (f === 'raven' ? 'raven' : FRUITS[f].img)

/** Original fruitGame (index.html:226): roll the die and pick fruit before the raven reaches the tree. */
export default function Game(props: GameProps) {
  const c = CFG[props.settings.age || 3]
  const [left, setLeft] = useState<Record<string, number>>(() => Object.fromEntries(c.kinds.map(k => [k, c.per])))
  const [basket, setBasket] = useState(0)
  const [ravenAt, setRavenAt] = useState(0)
  const [face, setFace] = useState<FruitKind | 'raven' | null>(null)
  const path = useRef<HTMLDivElement>(null)
  const tree = useRef<HTMLDivElement>(null)
  const die = useRef<HTMLButtonElement>(null)
  const dieLabel = useRef<HTMLSpanElement>(null)
  const basketBox = useRef<HTMLDivElement>(null)
  const basketImg = useRef<HTMLImageElement>(null)
  const goalTree = useRef<SVGSVGElement>(null)
  const raven = useRef<HTMLDivElement>(null)
  const clusters = useRef<Partial<Record<FruitKind, HTMLButtonElement | null>>>({})
  const rollPhase = useRef(false)

  useGame(props, g => {
    const { engine, say, later } = g
    const lf: Record<string, number> = { ...left }
    let ravenPos = 0
    let bk = 0
    let intro = true

    function drawTree() {
      const wasFull = basketImg.current?.getAttribute('src') === spriteUrl('basket_full')
      g.commit(() => { setLeft({ ...lf }); setBasket(bk) })
      c.kinds.forEach(k => clusters.current[k]?.classList.toggle('gone', !lf[k]))
      if (wasFull !== bk > 0) anim(basketImg.current, [{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 350 })
    }
    drawTree()

    function flyEl(src: string, size: number, from: Pt, to: Pt, ms: number, extra = '') {
      size = size * getScale()
      const e = document.createElement('img')
      e.src = spriteUrl(src)
      e.alt = ''
      e.style.cssText = `position:fixed;left:${from.x - size / 2}px;top:${from.y - size / 2}px;width:${size}px;height:${size}px;object-fit:contain;z-index:46;pointer-events:none`
      g.overlay(e)
      anim(e, [{ transform: 'translate(0,0)' }, { transform: `translate(${to.x - from.x}px,${to.y - from.y}px)` + extra }], { duration: ms, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards' })
      return e
    }

    function ravenSteal() {
      const rv = raven.current
      const rimg = rv?.querySelector('img')
      const p0 = rimg ? center(rimg) : { x: innerWidth / 2, y: 120 }
      if (rv) rv.style.visibility = 'hidden'
      tone([392, 330, 392, 523], 0.18, 'square', 0.12)
      say('까악까악! 까마귀가 나무에 도착했어!')
      const b = center(basketBox.current!), tr = center(tree.current!)
      const tmp = [flyEl('raven', 110, p0, { x: b.x, y: b.y - 90 }, 900)]
      later(() => {
        const fruits: [FruitKind, Pt][] = []
        c.kinds.forEach(k => { for (let i = 0; i < lf[k]; i++) fruits.push([k, tr]) })
        const bf = Math.min(bk, 6)
        for (let i = 0; i < bf; i++) fruits.push([c.kinds[i % c.kinds.length], b])
        c.kinds.forEach(k => { lf[k] = 0 })
        bk = 0
        drawTree()
        fruits.forEach(([k, from], i) => g.timeout(() => {
          tmp.push(flyEl(FRUITS[k].img, 54, { x: from.x + rnd(60) - 30, y: from.y + rnd(30) - 15 }, { x: b.x, y: b.y - 90 }, 500, ' scale(.4)'))
          tone([700 - i * 30], 0.06, 'triangle')
        }, i * 110))
        say('앗! 까마귀가 과일을 다 가져갔어!', '앗! 과일을 다 가져갔어!')
        g.timeout(() => {
          tmp.forEach(t => {
            const r = t.getBoundingClientRect()
            anim(t, [{ transform: getComputedStyle(t).transform }, { transform: `translate(${innerWidth - r.left + 150}px,${-r.top - 200}px) scale(.5)` }], { duration: 1200, easing: 'ease-in', fill: 'forwards' })
          })
        }, fruits.length * 110 + 600)
        later(() => {
          tmp.forEach(t => t.remove())
          say('다음엔 까마귀보다 먼저 따 보자!')
          later(() => g.finish('다음엔 더 빨리 따 보자!'), 400)
        }, fruits.length * 110 + 2000)
      }, 1000)
    }

    function shakeTree() {
      const t = goalTree.current
      if (!t) return
      t.style.transformOrigin = '50% 100%'
      anim(t, [{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(8deg)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(4deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(0)' }], { duration: 650, easing: 'ease-out' })
    }

    function kidEnding() {
      engine.sfx.win()
      const box = basketBox.current
      if (box) box.style.visibility = 'hidden'
      const veil = document.createElement('div')
      veil.style.cssText = 'position:fixed;inset:0;background:rgba(255,250,240,.8);z-index:44;pointer-events:none;opacity:0;transition:opacity .4s'
      g.overlay(veil)
      g.timeout(() => { veil.style.opacity = '1' }, 20)
      g.timeout(() => veil.remove(), 15000)
      const kh = innerHeight * 0.8, kw = (kh * 560) / 866, kt = Math.max(10, Math.min(innerHeight - kh - 10, innerHeight / 2 - kh / 2)), kx = innerWidth / 2 - kw / 2
      const k = document.createElement('img')
      k.src = spriteUrl('kid')
      k.alt = '아이'
      k.style.cssText = `position:fixed;left:${innerWidth + 20}px;top:${kt}px;height:${kh}px;z-index:46;pointer-events:none`
      g.overlay(k)
      const KX = -(innerWidth + 20 - kx)
      anim(k, [{ transform: 'translateX(0)' }, { transform: `translateX(${KX}px)` }], { duration: 1100, easing: 'cubic-bezier(.3,1.2,.5,1)', fill: 'forwards' })
      say('와! 과일을 다 땄다!')
      later(() => {
        anim(k, [{ transform: `translateX(${KX}px) translateY(0)` }, { transform: `translateX(${KX}px) translateY(-30px)` }, { transform: `translateX(${KX}px) translateY(0)` }], { duration: 500, iterations: 3, fill: 'forwards' })
        say('가족들이랑 나눠 먹어야지~')
        confetti()
        later(() => { k.remove(); veil.remove(); g.finish('과일을 다 땄어! 모두 성공!') }, 1500)
      }, 1300)
      g.timeout(() => k.remove(), 15000)
    }

    const faces = (): (FruitKind | 'raven')[] => [...c.kinds.filter(k => lf[k]), 'raven']
    const plan = makePlan(c.kinds.length * c.per, c.steps, Math.random() < RAVEN_WINS_P)

    function roll() {
      rollPhase.current = true
      g.commit(() => setFace(null))
      if (intro) {
        intro = false
        say('까마귀가 과일 먹으러 나무에 오고 있어! 까마귀가 오기 전에 과일을 다 따서 바구니에 담자. 주사위를 눌러 봐!', '까마귀보다 먼저 과일을 따자!')
      } else say('주사위를 눌러 봐!')
      armPress(engine, die.current, dieLabel.current, () => {
        rollPhase.current = false
        engine.sfx.roll()
        const fs = faces()
        let n = 0
        const iv = setInterval(() => {
          if (!g.alive()) { clearInterval(iv); return }
          const f = fs[rnd(fs.length)]
          g.commit(() => setFace(f))
          if (++n > 7) { clearInterval(iv); result(nextFace(plan, c.kinds.filter(k => lf[k]))) }
        }, 80)
      })
    }

    function result(f: FruitKind | 'raven') {
      g.commit(() => setFace(f))
      flash(die.current, 'pop')
      if (f === 'raven') {
        ravenPos++
        g.commit(() => setRavenAt(ravenPos))
        engine.sfx.soft()
        if (ravenPos >= c.steps) { later(ravenSteal, 700); return }
        say('까악! 까마귀가 과일 먹으러 한 칸 왔어.')
        later(roll, 2800)
        return
      }
      say(FRUITS[f].say + '!')
      later(() => pickFruit(f), 900)
    }

    function pickFruit(target: FruitKind) {
      const opts = c.kinds.filter(k => lf[k])
      say(FRUITS[target].name + ' 어디 있지?')
      engine.choose(opts.map(k => clusters.current[k]), i => {
        const k = opts[i]
        const el = clusters.current[k]
        if (k === target) {
          // Original fly(k) looked for an <svg> in the basket box (it holds an <img>), so no fruit ever flew. Kept as is.
          shakeTree()
          g.timeout(() => { lf[k]--; bk++; drawTree(); clusters.current[k]?.classList.remove('picked') }, 120)
          engine.sfx.good()
          say(FRUITS[k].name + ' 쏙!')
          if (Object.values(lf).reduce((a, b) => a + b, 0) === 1) later(kidEnding, 1100)
          else later(roll, 1200)
        } else {
          engine.sfx.soft()
          el?.classList.remove('picked')
          flash(el, 'nope')
          say('이건 ' + FRUITS[k].name + iya(FRUITS[k].name) + '. ' + FRUITS[target].name + eul(FRUITS[target].name) + ' 찾아볼까?')
          later(() => pickFruit(target), 1600)
        }
      })
    }

    roll()
  })

  // Original tapAnywhere: while the die waits, a tap anywhere on the screen rolls it.
  const tapAnywhere = (e: MouseEvent<HTMLDivElement>) => {
    const engine = props.engine
    if (!rollPhase.current || engine.isSettingsOpen() || props.settings.control === 'space') return
    if ((e.target as Element).closest('.corner')) return
    if (engine.chooser.isActive()) engine.chooser.pick(0)
  }

  const fruitSize = c.per > 2 ? 52 : 62
  return (
    <Screen onClick={tapAnywhere}>
      <div className="raven-path" ref={path}>
        {Array.from({ length: c.steps + 1 }, (_, i) => {
          const goal = i === c.steps
          const ravenHere = i === ravenAt
          const rv = ravenHere && (
            <div ref={raven} className={'raven' + (ravenAt > 0 ? ' hop' : '')} style={goal ? { position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)' } : undefined}>
              <Sprite name="raven" size={74} alt="까마귀" />
            </div>
          )
          return (
            <div key={i} className={'step' + (goal ? ' goal' : '')}>
              {goal ? (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Tree w={80} svgRef={goalTree} />
                  {rv}
                </div>
              ) : rv}
            </div>
          )
        })}
      </div>
      <div className="row" style={{ gap: 'calc(var(--vw)*4)', alignItems: 'center', marginTop: 'calc(var(--vh)*3)' }}>
        <div className="panel" style={{ background: '#DDEFD2', flexDirection: 'column', gap: 10, minWidth: 'min(calc(var(--vw)*44),500px)', padding: 22 }}>
          <div className="row" ref={tree} style={{ gap: 14 }}>
            {c.kinds.map(k => (
              <TapButton key={k} ref={el => { clusters.current[k] = el }} label={FRUITS[k].name} style={{ width: 150, height: 160, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', gap: 0, background: '#F3F8EE' }}>
                {Array.from({ length: left[k] }, (_, j) => <Sprite key={j} name={FRUITS[k].img} size={fruitSize} />)}
              </TapButton>
            ))}
          </div>
        </div>
        <PressButton label="주사위 굴리기" btnRef={die} labelRef={dieLabel} style={{ width: 170, height: 170, borderWidth: 5 }}>
          <span>{face ? <Sprite name={faceImg(face)} size={110} /> : <Sprite name="die" size={110} alt="주사위" />}</span>
        </PressButton>
        <div ref={basketBox} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img ref={basketImg} src={spriteUrl(basket > 0 ? 'basket_full' : 'basket_empty')} alt="바구니" draggable={false} style={{ width: 140, height: 125, objectFit: 'contain', pointerEvents: 'none' }} />
          <span className="jua" style={{ fontSize: 26 }}>{basket}개</span>
        </div>
      </div>
    </Screen>
  )
}
