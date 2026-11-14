import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
  localStorage.setItem('mongsil-settings', JSON.stringify({ age: 3, voiceVol: 0 }))
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); localStorage.clear() })

const bubble = () => document.getElementById('bubble')!.textContent
const space = () => act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true })) })

function toHomeThenSettingsAndSave() {
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: '시작!' }))
  expect(screen.getByRole('heading', { name: '무슨 놀이 할까?' })).toBeTruthy()
  const gear = screen.getByRole('button', { name: /보호자 설정/ })
  fireEvent.pointerDown(gear)
  act(() => { vi.advanceTimersByTime(3000) })
  fireEvent.click(screen.getByRole('button', { name: '저장하고 게임으로' }))
}

it('home tiles respond to click after saving settings from home', () => {
  toHomeThenSettingsAndSave()
  act(() => { vi.advanceTimersByTime(10) })
  fireEvent.click(screen.getByRole('button', { name: /곰돌이 간식/ }))
  expect(bubble()).toBe('곰돌이 간식!')
})

it('home tiles respond to space after saving settings from home', () => {
  toHomeThenSettingsAndSave()
  act(() => { vi.advanceTimersByTime(10) })
  space()
  expect(bubble()).toBe('과일 따기!')
})

it('a voice changed in settings is used right after save', () => {
  const voices = [{ name: 'A', lang: 'ko-KR' }, { name: 'B', lang: 'ko-KR' }] as SpeechSynthesisVoice[]
  const used: (string | undefined)[] = []
  vi.stubGlobal('speechSynthesis', { getVoices: () => voices, speak: (u: { voice?: SpeechSynthesisVoice }) => { used.push(u.voice?.name) }, cancel: () => {}, onvoiceschanged: null })
  vi.stubGlobal('SpeechSynthesisUtterance', class { voice: SpeechSynthesisVoice | null = null; constructor(public text: string) {} })
  localStorage.setItem('mongsil-settings', JSON.stringify({ age: 3, voiceVol: 80 }))
  render(<App />)
  fireEvent.click(screen.getByRole('button', { name: '시작!' }))
  fireEvent.pointerDown(screen.getByRole('button', { name: /보호자 설정/ }))
  act(() => { vi.advanceTimersByTime(3000) })
  fireEvent.click(screen.getByRole('button', { name: '소리' }))
  fireEvent.change(screen.getByRole('combobox', { name: '목소리 종류' }), { target: { value: 'B' } })
  used.length = 0
  fireEvent.click(screen.getByRole('button', { name: '저장하고 게임으로' }))
  act(() => { vi.advanceTimersByTime(10) })
  expect(used[used.length - 1]).toBe("B")
})
