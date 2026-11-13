const DIG = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

export function eul(w: string): '을' | '를' {
  const s = String(w)
  const c = s.charCodeAt(s.length - 1) - 0xac00
  return c >= 0 && c % 28 ? '을' : '를'
}

export function iya(w: string): '이야' | '야' {
  const c = w.charCodeAt(w.length - 1) - 0xac00
  return c >= 0 && c % 28 ? '이야' : '야'
}

export function kor(n: number): string {
  const t = Math.floor(n / 10)
  const o = n % 10
  return (t ? (t > 1 ? DIG[t] : '') + '십' : '') + DIG[o]
}

export function splitT(t: string): string[] {
  return String(t)
    .split(/(?<=[!?.~])\s+|\s*\|\s*/)
    .map(x => x.trim())
    .filter(Boolean)
}
