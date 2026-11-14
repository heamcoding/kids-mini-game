/** Same-origin by default (nginx proxies /api/*); VITE_API_URL overrides it for a separately hosted API. */
export const apiUrl = (path: string) => `${import.meta.env.VITE_API_URL ?? ''}${path}`
