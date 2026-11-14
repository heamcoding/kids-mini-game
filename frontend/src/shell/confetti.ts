const COLS = ['#E35D4B', '#F4C431', '#3D7CCB', '#4E9A5B', '#8C6A9E', '#F7B9C4']
const rnd = (n: number) => Math.floor(Math.random() * n)

export function confetti(): void {
  const W = innerWidth
  const H = innerHeight
  ;([[0.08, 1], [0.92, -1]] as const).forEach(([sx, dir], burst) => {
    for (let i = 0; i < 45; i++) {
      const p = document.createElement('div')
      const sz = 8 + rnd(10)
      p.style.cssText = `position:fixed;left:${W * sx}px;top:${H - 20}px;width:${sz}px;height:${sz * (Math.random() < 0.5 ? 1 : 1.8)}px;background:${COLS[rnd(COLS.length)]};border-radius:${Math.random() < 0.4 ? '50%' : '3px'};z-index:45;pointer-events:none`
      document.body.appendChild(p)
      const vx = dir * (W * (0.15 + Math.random() * 0.35))
      const peak = H * (0.45 + Math.random() * 0.45)
      const rot = rnd(720) - 360
      const d = 1600 + rnd(900)
      try {
        p.animate(
          [
            { transform: 'translate(0,0) rotate(0)', opacity: 1 },
            { transform: `translate(${vx * 0.6}px,${-peak}px) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${vx}px,${-peak * 0.2}px) rotate(${rot}deg)`, opacity: 0 },
          ],
          { duration: d, delay: burst * 250 + rnd(150), easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' },
        )
      } catch { /* no Web Animations */ }
      setTimeout(() => p.remove(), d + 700)
    }
  })
}
