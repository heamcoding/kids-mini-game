import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { BASE } from '../settings/defaults'
import type { Settings } from '../settings/types'
import { createEngine } from '../engine'
import { EngineProvider } from '../engine/context'
import { ChoiceRow } from './ChoiceRow'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup(control: Settings['control']) {
  const s: Settings = { ...BASE, control, voiceVol: 0 }
  const engine = createEngine(() => s)
  const off = engine.attach()
  const onPick = vi.fn()
  render(
    <EngineProvider engine={engine}>
      <ChoiceRow items={['가', '나', '다']} render={x => x} getLabel={x => x} onPick={onPick} />
    </EngineProvider>,
  )
  return { onPick, off }
}
const space = () => act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true })) })

it("control='space': click ignored, space picks the scanned item", () => {
  const { onPick, off } = setup('space')
  fireEvent.click(screen.getByRole('button', { name: '나' }))
  expect(onPick).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: '가' }).className).toContain('scan')
  space()
  expect(onPick).toHaveBeenCalledWith('가', 0)
  off()
})

it("control='touch': no scanning, click picks", () => {
  const { onPick, off } = setup('touch')
  act(() => { vi.advanceTimersByTime(20000) })
  for (const b of screen.getAllByRole('button')) expect(b.className).not.toContain('scan')
  space()
  expect(onPick).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '다' }))
  expect(onPick).toHaveBeenCalledWith('다', 2)
  off()
})

it("control='both': scan advances by scan seconds", () => {
  const { off } = setup('both')
  act(() => { vi.advanceTimersByTime(3000) })
  expect(screen.getByRole('button', { name: '나' }).className).toContain('scan')
  off()
})
