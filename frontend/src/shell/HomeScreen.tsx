import { useEffect } from 'react'
import { ChoiceRow } from '../components/ChoiceRow'
import { Screen } from '../components/Screen'
import { Sprite } from '../components/Sprite'
import { Title } from '../components/Title'
import { useEngine } from '../engine/context'
import { GAMES, type GameDef } from './games'

const TEXT_ICON: Record<string, [string, string]> = { num: ['7', '#3D7CCB'], abc: ['ABC', '#E35D4B'], kor: ['가나다', '#4E9A5B'] }

export function HomeScreen({ onLaunch }: { onLaunch(id: string): void }) {
  const engine = useEngine()
  useEffect(() => { engine.say('무슨 놀이 할까?') }, [engine])
  return (
    <Screen>
      <Title>무슨 놀이 할까?</Title>
      <ChoiceRow<GameDef>
        items={GAMES}
        rowClassName="home-grid"
        buttonClassName="tile"
        getLabel={g => g.title}
        render={g => {
          const t = TEXT_ICON[g.id]
          return (
            <>
              {t ? <span className="jua" style={{ fontSize: 38, lineHeight: '66px', color: t[1] }}>{t[0]}</span> : <Sprite name={g.icon!} size={66} />}
              <span className="nm">{g.title}</span>
            </>
          )
        }}
        onPick={g => {
          engine.say(g.title + '!')
          engine.later(() => onLaunch(g.id), 900)
        }}
      />
    </Screen>
  )
}
