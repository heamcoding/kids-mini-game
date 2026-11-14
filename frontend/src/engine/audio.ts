let actx: AudioContext | null = null
let fxVolume = 60

export function setFxVol(v: number): void { fxVolume = v }

export function getAudio(): AudioContext | null {
  if (!actx) {
    try {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }
      const Ctor = w.AudioContext || w.webkitAudioContext
      if (Ctor) actx = new Ctor()
    } catch { /* unsupported */ }
  }
  if (actx && actx.state === 'suspended') { try { void actx.resume() } catch { /* ignore */ } }
  return actx
}

export function tone(freqs: number[], dur = 0.15, type: OscillatorType = 'sine', gap = 0.12, fxVol: number = fxVolume): void {
  const a = getAudio()
  if (!a || fxVol <= 0) return
  const v = (fxVol / 100) * 0.25
  freqs.forEach((f, i) => {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.value = f
    const t = a.currentTime + i * gap
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(v, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    o.connect(g).connect(a.destination)
    o.start(t)
    o.stop(t + dur + 0.05)
  })
}

export const sfx = {
  tap: () => tone([660], 0.08, 'triangle'),
  good: () => tone([523, 659, 784], 0.22, 'triangle', 0.11),
  soft: () => tone([330, 294], 0.18, 'sine', 0.14),
  roll: () => tone([400, 450, 500, 550], 0.06, 'square', 0.06),
  win: () => tone([523, 659, 784, 1047, 784, 1047], 0.25, 'triangle', 0.13),
  flip: () => tone([520], 0.07, 'sine'),
} satisfies Record<string, () => void>
