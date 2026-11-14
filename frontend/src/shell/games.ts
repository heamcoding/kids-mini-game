import type { ComponentType } from 'react'
import type { Engine } from '../engine'
import type { Settings } from '../settings/types'
import BearGame from '../games/bear/Game'
import ChickGame from '../games/chick/Game'
import FruitGame from '../games/fruit/Game'
import MemoryGame from '../games/memory/Game'
import OwlGame from '../games/owl/Game'
import PopGame from '../games/pop/Game'
import SameGame from '../games/same/Game'
import SquirrelGame from '../games/squirrel/Game'
import { withRecordPlay } from '../games/withRecordPlay'
import { makePlaceholder } from './Placeholder'

export type GameProps = { settings: Settings; engine: Engine; onFinish(msg?: string): void; onHome(): void }

export type GameDef = { id: string; title: string; icon: string | null; component: ComponentType<GameProps> }

/** Every game goes through withRecordPlay: finishing records the play (fire-and-forget) before the shell's onFinish. */
const def = (id: string, title: string, icon: string | null, game?: ComponentType<GameProps>): GameDef =>
  ({ id, title, icon, component: withRecordPlay(id, game ?? makePlaceholder(title)) })

export const GAMES: GameDef[] = [
  def('fruit', '과일 따기', 'apple', FruitGame),
  def('chick', '병아리 세기', 'chick1', ChickGame),
  def('owl', '부엉이 둥지로', 'owl', OwlGame),
  def('squirrel', '다람쥐 도토리', 'squirrel', SquirrelGame),
  def('pop', '깜짝 통', 'barrel2', PopGame),
  def('memory', '짝 찾기', 'f_tri', MemoryGame),
  def('same', '같은 그림 찾기', 'f_circle', SameGame),
  def('bear', '곰돌이 간식', 'bear', BearGame),
  def('mole', '두더지 잡기', 'mole'),
  def('size', '크다 작다', 'bigrabbit'),
  def('num', '숫자 찾기', null),
  def('abc', 'ABC 찾기', null),
  def('kor', '가나다 찾기', null),
]

const FIMG = ['bigrabbit', 'chick1', 'f_bear', 'f_circle', 'f_tri', 'f_square', 'f_diamond']

/** Sprites each game needs before it starts (original GIMG). */
export const GAME_IMAGES: Record<string, string[]> = {
  fruit: ['apple', 'pear', 'plum', 'grapes', 'raven', 'kid', 'basket_empty', 'basket_full', 'die'],
  chick: ['chick1'],
  owl: ['owl', 'owl_sit', 'nest'],
  squirrel: ['squirrel', 'acorn3_red', 'acorn3_yellow', 'acorn3_blue'],
  pop: ['barrel_blank', 'bigrabbit'],
  memory: FIMG,
  same: FIMG,
  bear: ['bear', 'bear_happy', 'die', 'candy_red', 'candy_yellow', 'candy_green', 'candy_blue', 'candy_purple', 'candy_pink', 'candy_orange'],
  mole: ['mole', 'mole_hurt', 'mole_burst'],
  size: FIMG,
}
