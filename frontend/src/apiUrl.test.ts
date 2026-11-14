import { afterEach, expect, it, vi } from 'vitest'
import { apiUrl } from './apiUrl'

afterEach(() => vi.unstubAllEnvs())

it('is same-origin by default', () => {
  vi.stubEnv('VITE_API_URL', undefined as unknown as string)
  expect(apiUrl('/api/settings')).toBe('/api/settings')
})
it('prefixes VITE_API_URL when set', () => {
  vi.stubEnv('VITE_API_URL', 'https://api.example')
  expect(apiUrl('/api/stats')).toBe('https://api.example/api/stats')
})
