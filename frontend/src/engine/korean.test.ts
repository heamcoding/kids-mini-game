import { describe, expect, it } from 'vitest'
import { eul, iya, kor, splitT } from './korean'

describe('korean', () => {
  it('eul', () => { expect(eul('사과')).toBe('를'); expect(eul('곰')).toBe('을') })
  it('iya', () => { expect(iya('토끼')).toBe('야'); expect(iya('곰')).toBe('이야') })
  it('kor', () => { expect(kor(10)).toBe('십'); expect(kor(21)).toBe('이십일'); expect(kor(99)).toBe('구십구') })
  it('splitT', () => { expect(splitT('안녕! 나는 몽실이야. 반가워 | 응')).toEqual(['안녕!', '나는 몽실이야.', '반가워', '응']) })
})
