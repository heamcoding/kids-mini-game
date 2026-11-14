import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createEngine } from '../engine'
import { EngineProvider } from '../engine/context'
import { BASE } from '../settings/defaults'
import { QuestionCard } from './QuestionCard'

function setup(front: React.ReactNode | null, onReplay = vi.fn()) {
  const engine = createEngine(() => ({ ...BASE, voiceVol: 0 }))
  render(
    <EngineProvider engine={engine}>
      <QuestionCard width={140} front={front} onReplay={onReplay} />
    </EngineProvider>,
  )
  return onReplay
}

it('shows the mystery back when there is no front', () => {
  setup(null)
  expect(screen.getByText('?')).toBeTruthy()
  expect(document.querySelector('.card-back')).toBeTruthy()
  expect(document.querySelector('.tap.pop')).toBeNull()
})

it('shows the front content popped in when given', () => {
  setup(<span>사과</span>)
  expect(screen.getByText('사과')).toBeTruthy()
  expect(document.querySelector('.tap.pop')).toBeTruthy()
  expect(screen.queryByText('?')).toBeNull()
})

it('has a replay button that calls onReplay', () => {
  const onReplay = setup(null)
  fireEvent.click(screen.getByLabelText('다시 듣기'))
  expect(onReplay).toHaveBeenCalled()
})
