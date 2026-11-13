import type { Settings } from './types'

export const BASE: Settings = {
  age: null, scan: 3, touchTime: 10, control: 'both', voiceVol: 80, fxVol: 60,
  rounds: 5, rate: 0.9, pitch: 1.5, gap: 0.6, voiceName: '',
}

export const AGE_DEF: Record<3 | 4 | 5, { scan: number; touchTime: number }> = {
  3: { scan: 3, touchTime: 10 },
  4: { scan: 2.5, touchTime: 8 },
  5: { scan: 2.2, touchTime: 6 },
}
