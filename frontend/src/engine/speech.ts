import type { Settings } from '../settings/types'
import { splitT } from './korean'

type Item = { t: string; cb: (() => void) | null }
export type Speaker = {
  speak(text: string, cb?: () => void): void
  hush(): void
  isSpeaking(): boolean
  setPreview(s: Settings | null): void
}

const vkey = (t: string) => String(t).replace(/[!?.~,\s]+$/, '').trim()

export function createSpeaker(getSettings: () => Settings): Speaker {
  let koVoice: SpeechSynthesisVoice | null = null
  let spQ: Item[] = []
  let speaking = false
  let spGen = 0
  let preview: Settings | null = null
  let VOICE: Record<string, string> | null = null
  const V = () => preview || getSettings()

  const koVoices = (): SpeechSynthesisVoice[] => {
    try { return speechSynthesis.getVoices().filter(v => /ko/i.test(v.lang)) } catch { return [] }
  }
  const pickVoice = () => {
    const vs = koVoices()
    const n = V().voiceName
    koVoice = (n && vs.find(v => v.name === n)) || vs[0] || null
  }
  try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice } catch { /* no speechSynthesis */ }
  try {
    fetch('voice/manifest.json')
      .then(r => (r.ok ? r.json() : null))
      .then(m => { if (m && typeof m === 'object') VOICE = m })
      .catch(() => {})
  } catch { /* no fetch */ }

  function hush() {
    spGen++
    spQ = []
    speaking = false
    try { speechSynthesis.cancel() } catch { /* ignore */ }
  }

  function nextSpeak() {
    const it = spQ.shift()
    if (!it) { speaking = false; return }
    speaking = true
    const g = spGen
    let done = false
    let tm: ReturnType<typeof setTimeout>
    const fin = () => {
      if (done || g !== spGen) return
      done = true
      clearTimeout(tm)
      setTimeout(() => {
        if (g !== spGen) return
        if (it.cb) it.cb()
        nextSpeak()
      }, (V().gap || 0) * 1000)
    }
    tm = setTimeout(fin, Math.max(600, it.t.length * (V().voiceVol > 0 ? 320 : 120) / (V().rate || 1)) + (V().voiceVol > 0 ? 2000 : 0))
    if (V().voiceVol <= 0) return
    const tts = () => {
      try {
        const u = new SpeechSynthesisUtterance(it.t)
        u.lang = 'ko-KR'
        if (koVoice) u.voice = koVoice
        u.rate = V().rate || 0.85
        u.pitch = V().pitch || 1.2
        u.volume = V().voiceVol / 100
        u.onend = fin
        u.onerror = fin
        speechSynthesis.speak(u)
      } catch { /* fallback timer will finish */ }
    }
    const f = VOICE && VOICE[vkey(it.t)]
    if (f) {
      try {
        const au = new Audio('voice/' + f)
        au.volume = V().voiceVol / 100
        au.onended = fin
        au.onerror = tts
        const p = au.play()
        if (p && p.catch) p.catch(tts)
      } catch { tts() }
    } else tts()
  }

  function speak(text: string, cb?: () => void) {
    const parts = splitT(text)
    if (!parts.length) { if (cb) cb(); return }
    const items: Item[] = parts.map((p, i) => ({ t: p, cb: i === parts.length - 1 ? cb ?? null : null }))
    if (speaking) spQ = spQ.filter(x => x.cb).concat(items)
    else { spQ = items; nextSpeak() }
  }

  return { speak, hush, isSpeaking: () => speaking, setPreview: s => { preview = s } }
}
