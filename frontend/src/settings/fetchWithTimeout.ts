/** fetch that aborts (and so rejects) after `ms`. Without AbortController it degrades to a plain fetch. */
export async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null
  const t = setTimeout(() => ctl?.abort(), ms)
  try {
    return await fetch(url, { ...init, signal: ctl?.signal })
  } finally {
    clearTimeout(t)
  }
}
