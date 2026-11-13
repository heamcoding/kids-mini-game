import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EngineProvider } from './engine/context'
import { createEngine } from './engine'
import { useSettings } from './settings/useSettings'
import { AgeScreen } from './shell/AgeScreen'
import { FinishScreen } from './shell/FinishScreen'
import { GAMES } from './shell/games'
import { HomeScreen } from './shell/HomeScreen'
import { LoadingScreen } from './shell/LoadingScreen'
import { launchGame, preloadAll } from './shell/preload'
import { RestScreen } from './shell/RestScreen'
import { SettingsPanel } from './shell/SettingsPanel'
import { Stage } from './shell/Stage'
import { StartScreen } from './shell/StartScreen'

type Route =
  | { name: 'start' }
  | { name: 'age' }
  | { name: 'home' }
  | { name: 'loading' }
  | { name: 'game'; id: string }
  | { name: 'finish'; msg?: string }
  | { name: 'rest' }

export default function App() {
  const { settings, update } = useSettings()
  const ref = useRef(settings)
  ref.current = settings
  const engine = useMemo(() => createEngine(() => ref.current), [])
  const [route, setRoute] = useState<Route>({ name: 'start' })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rounds, setRounds] = useState(0)
  const roundsRef = useRef(0)
  const cancelLaunch = useRef<(() => void) | null>(null)

  useEffect(() => engine.attach(), [engine])
  useEffect(() => { engine.sync() }, [engine, settings])
  useEffect(() => { const t = setTimeout(preloadAll, 2000); return () => clearTimeout(t) }, [])

  const go = useCallback((r: Route) => { cancelLaunch.current?.(); cancelLaunch.current = null; setRoute(r) }, [])
  const home = useCallback(() => go({ name: 'home' }), [go])
  const homeOrAge = useCallback(() => go({ name: ref.current.age ? 'home' : 'age' }), [go])

  const launch = useCallback((id: string) => {
    cancelLaunch.current?.()
    cancelLaunch.current = launchGame(id, () => setRoute({ name: 'loading' }), () => { cancelLaunch.current = null; setRoute({ name: 'game', id }) })
  }, [])

  const finish = useCallback((msg?: string) => {
    roundsRef.current += 1
    setRounds(roundsRef.current)
    go({ name: 'finish', msg })
  }, [go])
  const afterFinish = useCallback(() => go({ name: roundsRef.current >= ref.current.rounds ? 'rest' : 'home' }), [go])
  const continueAfterRest = useCallback(() => { roundsRef.current = 0; setRounds(0); home() }, [home])

  const openSettings = () => { engine.setSettingsOpen(true); setSettingsOpen(true) }
  const closeSettings = (next: typeof settings) => {
    update(next)
    ref.current = next
    engine.setSettingsOpen(false)
    setSettingsOpen(false)
    go({ name: 'home' })
  }

  const game = route.name === 'game' ? GAMES.find(g => g.id === route.id) : undefined
  const Game = game?.component

  return (
    <EngineProvider engine={engine}>
      <Stage onHome={homeOrAge} onSettings={openSettings}>
        {route.name === 'start' && <StartScreen onStart={homeOrAge} />}
        {route.name === 'age' && <AgeScreen update={update} onDone={home} />}
        {route.name === 'home' && <HomeScreen onLaunch={launch} />}
        {route.name === 'loading' && <LoadingScreen />}
        {Game && <Game key={game!.id} settings={settings} engine={engine} onFinish={finish} onHome={home} />}
        {route.name === 'finish' && <FinishScreen msg={route.msg} onDone={afterFinish} />}
        {route.name === 'rest' && <RestScreen rounds={settings.rounds} onContinue={continueAfterRest} />}
      </Stage>
      {settingsOpen && <SettingsPanel settings={settings} roundsPlayed={rounds} onSave={closeSettings} />}
    </EngineProvider>
  )
}
