import { Sprite } from './Sprite'

const EYES: [number, number][] = [[0.325, 0.4117], [0.5833, 0.67]]
const Y0 = 0.4752
const Y1 = 0.604
const PAD = 0.012

/** Mongsil sprite with blinking eyelids (original mongsilImg). */
export function Mongsil({ size, alt = '몽실이' }: { size: number; alt?: string }) {
  const k = 600 / 404
  const h = size / k
  const top = (size - h) / 2
  const bw = Math.max(2, size * 0.02)
  return (
    <span className="mwrap" style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <Sprite name="mongsil" size={size} alt={alt} />
      {EYES.map(([x0, x1]) => (
        <span
          key={x0}
          className="mlid"
          style={{
            left: (x0 - PAD) * size,
            top: top + (Y0 - PAD) * h,
            width: (x1 - x0 + PAD * 2) * size,
            height: (Y1 - Y0 + PAD * 2) * h,
          }}
        >
          <span style={{ position: 'absolute', left: '12%', right: '12%', top: '28%', height: '40%', borderBottom: `${bw}px solid #5A2810`, borderRadius: '0 0 50% 50%' }} />
        </span>
      ))}
    </span>
  )
}
