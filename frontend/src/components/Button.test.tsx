import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { Button } from './Button'
import { Title } from './Title'

it('Button renders btn / btn primary and clicks', () => {
  const f = vi.fn()
  render(<><Button onClick={f}>a</Button><Button primary onClick={f}>b</Button></>)
  expect(screen.getByRole('button', { name: 'a' }).className).toBe('btn')
  expect(screen.getByRole('button', { name: 'b' }).className).toBe('btn primary')
  fireEvent.click(screen.getByRole('button', { name: 'b' }))
  expect(f).toHaveBeenCalledTimes(1)
})

it('Title passes style and className through', () => {
  render(<Title style={{ marginTop: 6 }} className="x">hi</Title>)
  const h = screen.getByRole('heading', { name: 'hi' })
  expect(h.className).toBe('title x')
  expect(h.style.marginTop).toBe('6px')
})
