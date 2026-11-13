const KEY = 'mongsil-device-id'

function uuid(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 3) | 8).toString(16)
  })
}

let memo: string | null = null

export function getDeviceId(): string {
  try {
    const v = localStorage.getItem(KEY)
    if (v) return v
    const id = uuid()
    localStorage.setItem(KEY, id)
    return id
  } catch {
    return (memo ??= uuid())
  }
}
