import type { Settings } from '../settings/types'
import { attachSpaceKey, createChooser, type Chooser } from './chooser'
import { setFxVol, sfx } from './audio'
import { createScheduler, type Scheduler } from './scheduler'
import { createSpeaker, type Speaker } from './speech'

export type Engine = {
  speak(text: string, cb?: () => void): void
  /** Speak `text` and show `show ?? text` in the guide bubble. With `cb`, it runs after speech unless the screen changed or settings are open. */
  say(text: string, show?: string, cb?: () => void): void
  later(fn: () => void, ms: number): number
  choose: Chooser['choose']
  stopChoose(): void
  sfx: typeof sfx
  speaker: Speaker
  scheduler: Scheduler
  chooser: Chooser
  /** Call when a new screen mounts: invalidates timers, stops the chooser and speech, clears the bubble. */
  newScreen(): void
  setSettingsOpen(open: boolean): void
  isSettingsOpen(): boolean
  getBubble(): string
  setBubble(t: string): void
  subscribeBubble(fn: () => void): () => void
  /** Re-read settings (call when they change): pushes the effects volume to the audio module. */
  sync(): void
  /** Install the global space-key handler; returns cleanup. */
  attach(): () => void
}

export function createEngine(getSettings: () => Settings): Engine {
  let settingsOpen = false
  let bubble = ''
  const listeners = new Set<() => void>()

  const speaker = createSpeaker(getSettings)
  const scheduler = createScheduler({ isSpeaking: speaker.isSpeaking })
  const chooser = createChooser({ getSettings, isBlocked: () => settingsOpen, onTap: sfx.tap })

  const setBubble = (t: string) => {
    if (t === bubble) return
    bubble = t
    listeners.forEach(l => l())
  }
  const speak = (text: string, cb?: () => void) => speaker.speak(text, cb)

  const sync = () => setFxVol(getSettings().fxVol)
  sync()

  return {
    speak,
    say(text, show, cb) {
      setBubble(String(show === undefined ? text : show).replace(/\s*\|\s*/g, ' '))
      if (cb) {
        const t = scheduler.token()
        speak(text, () => { if (t === scheduler.token() && !settingsOpen) cb() })
      } else speak(text)
    },
    later: (fn, ms) => scheduler.later(fn, ms),
    choose: chooser.choose,
    stopChoose: chooser.stop,
    sfx,
    speaker,
    scheduler,
    chooser,
    newScreen() {
      scheduler.bump()
      chooser.stop()
      speaker.hush()
      setBubble('')
    },
    setSettingsOpen(open) {
      settingsOpen = open
      scheduler.setPaused(open)
      if (open) { scheduler.bump(); chooser.stop(); speaker.hush() }
    },
    isSettingsOpen: () => settingsOpen,
    getBubble: () => bubble,
    setBubble,
    subscribeBubble(fn) { listeners.add(fn); return () => { listeners.delete(fn) } },
    sync,
    attach: () => attachSpaceKey(chooser),
  }
}
