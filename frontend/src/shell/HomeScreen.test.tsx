import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { BASE } from '../settings/defaults'
import { createEngine } from '../engine'
import { EngineProvider } from '../engine/context'
import { HomeScreen } from './HomeScreen'
import { GAMES } from './games'

const TITLES = ['과일 따기', '병아리 세기', '부엉이 둥지로', '다람쥐 도토리', '깜짝 통', '짝 찾기', '같은 그림 찾기', '곰돌이 간식', '두더지 잡기', '크다 작다', '숫자 찾기', 'ABC 찾기', '가나다 찾기']

it('renders 13 game buttons with the original titles', () => {
  const engine = createEngine(() => ({ ...BASE, voiceVol: 0 }))
  render(<EngineProvider engine={engine}><HomeScreen onLaunch={() => {}} /></EngineProvider>)
  expect(GAMES.map(g => g.title)).toEqual(TITLES)
  expect(GAMES.map(g => g.id)).toEqual(['fruit', 'chick', 'owl', 'squirrel', 'pop', 'memory', 'same', 'bear', 'mole', 'size', 'num', 'abc', 'kor'])
  for (const t of TITLES) expect(screen.getByRole('button', { name: new RegExp(t) })).toBeTruthy()
  expect(screen.getAllByRole('button')).toHaveLength(13)
})
