import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BASE } from '../settings/defaults'
import type { Settings } from '../settings/types'
import { createSpeaker } from './speech'

const voices = [{ name: 'A', lang: 'ko-KR' }, { name: 'B', lang: 'ko-KR' }] as SpeechSynthesisVoice[]
let used: (SpeechSynthesisVoice | null)[]

beforeEach(() => {
  vi.useFakeTimers()
  used = []
  vi.stubGlobal('speechSynthesis', { getVoices: () => voices, speak: (u: { voice: SpeechSynthesisVoice | null }) => { used.push(u.voice) }, cancel: () => {}, onvoiceschanged: null })
  vi.stubGlobal('SpeechSynthesisUtterance', class { voice: SpeechSynthesisVoice | null = null; constructor(public text: string) {} })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

const say = (sp: ReturnType<typeof createSpeaker>) => { sp.hush(); sp.speak('안녕'); }

describe('voice selection', () => {
  it('uses the new saved voice after setPreview(null) once settings changed', () => {
    let s: Settings = { ...BASE, voiceName: 'A' }
    const sp = createSpeaker(() => s)
    sp.setPreview({ ...s, voiceName: 'B' })
    s = { ...s, voiceName: 'B' }
    sp.setPreview(null)
    say(sp)
    expect(used[used.length - 1]?.name).toBe('B')
  })
  it('preview speaks with the draft voice', () => {
    const s: Settings = { ...BASE, voiceName: 'A' }
    const sp = createSpeaker(() => s)
    sp.setPreview({ ...s, voiceName: 'B' })
    say(sp)
    expect(used[used.length - 1]?.name).toBe('B')
  })
  it('cancelling the preview restores the saved voice', () => {
    const s: Settings = { ...BASE, voiceName: 'A' }
    const sp = createSpeaker(() => s)
    sp.setPreview({ ...s, voiceName: 'B' })
    sp.setPreview(null)
    say(sp)
    expect(used[used.length - 1]?.name).toBe('A')
  })
})
