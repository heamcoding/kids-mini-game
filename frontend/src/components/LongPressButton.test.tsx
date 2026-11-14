import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LongPressButton } from './LongPressButton'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const setup = (ms = 3000) => {
  const cb = vi.fn()
  render(<LongPressButton ms={ms} icon={<i />} label="길게" onTrigger={cb} />)
  return { cb, btn: screen.getByRole('button', { name: '길게' }) }
}

it('does not fire at 2999ms, fires at 3000ms', () => {
  const { cb, btn } = setup(3000)
  fireEvent.pointerDown(btn)
  act(() => { vi.advanceTimersByTime(2999) })
  expect(cb).not.toHaveBeenCalled()
  act(() => { vi.advanceTimersByTime(1) })
  expect(cb).toHaveBeenCalledTimes(1)
})

it('cancels on pointerup, leave and cancel', () => {
  for (const ev of ['pointerUp', 'pointerLeave', 'pointerCancel'] as const) {
    const { cb, btn } = setup(1500)
    fireEvent.pointerDown(btn)
    act(() => { vi.advanceTimersByTime(1000) })
    fireEvent[ev](btn)
    act(() => { vi.advanceTimersByTime(2000) })
    expect(cb).not.toHaveBeenCalled()
    document.body.innerHTML = ''
  }
})
