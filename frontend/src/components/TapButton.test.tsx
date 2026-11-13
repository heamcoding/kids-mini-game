import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { TapButton } from './TapButton'

it('calls onPick on click and exposes the label', () => {
  const onPick = vi.fn()
  render(<TapButton label="시작" onPick={onPick}>go</TapButton>)
  fireEvent.click(screen.getByRole('button', { name: '시작' }))
  expect(onPick).toHaveBeenCalledTimes(1)
})

it('shows scan and picked states', () => {
  render(<TapButton label="a" scan picked>x</TapButton>)
  const b = screen.getByRole('button', { name: 'a' })
  expect(b.className).toContain('scan')
  expect(b.className).toContain('picked')
})
