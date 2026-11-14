import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerSw } from './registerSw'
import { isSwOk } from './shell/install'

const setSw = (sw: unknown) => Object.defineProperty(navigator, 'serviceWorker', { value: sw, configurable: true })

afterEach(() => {
  vi.unstubAllEnvs()
  Reflect.deleteProperty(navigator, 'serviceWorker')
})

describe('registerSw', () => {
  it('does nothing outside production builds', () => {
    const register = vi.fn(() => Promise.resolve({}))
    setSw({ register })
    vi.stubEnv('PROD', false)
    registerSw()
    expect(register).not.toHaveBeenCalled()
  })

  it('registers ./sw.js in production and flags swOk', async () => {
    const register = vi.fn(() => Promise.resolve({}))
    setSw({ register })
    vi.stubEnv('PROD', true)
    registerSw()
    expect(register).toHaveBeenCalledWith('./sw.js')
    await Promise.resolve(); await Promise.resolve()
    expect(isSwOk()).toBe(true)
  })

  it('does nothing without serviceWorker support', () => {
    vi.stubEnv('PROD', true)
    expect(() => registerSw()).not.toThrow()
  })

  it('swallows async and sync errors', async () => {
    vi.stubEnv('PROD', true)
    setSw({ register: vi.fn(() => Promise.reject(new Error('x'))) })
    expect(() => registerSw()).not.toThrow()
    setSw({ register: vi.fn(() => { throw new Error('y') }) })
    expect(() => registerSw()).not.toThrow()
    await Promise.resolve()
  })
})
