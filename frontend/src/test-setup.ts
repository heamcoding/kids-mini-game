// Node 25 ships an experimental global `localStorage` that shadows jsdom's and lacks methods.
// Install a minimal in-memory Storage so tests behave like a browser.
class MemoryStorage implements Storage {
  private m = new Map<string, string>()
  get length() { return this.m.size }
  clear() { this.m.clear() }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null }
  key(i: number) { return [...this.m.keys()][i] ?? null }
  removeItem(k: string) { this.m.delete(k) }
  setItem(k: string, v: string) { this.m.set(k, String(v)) }
  [name: string]: unknown
}
Object.defineProperty(globalThis, 'Storage', { value: MemoryStorage, configurable: true })
Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
Object.defineProperty(window, 'localStorage', { value: globalThis.localStorage, configurable: true })
