import { useCallback, useRef, type ComponentType } from 'react'
import type { GameProps } from '../shell/games'
import { recordPlay } from './recordPlay'

/**
 * Wraps a game so that finishing it records the play (fire-and-forget) and then calls the shell's
 * onFinish straight away. Every game in GAMES goes through this once.
 */
export function withRecordPlay(gameId: string, Game: ComponentType<GameProps>): ComponentType<GameProps> {
  function Recorded(props: GameProps) {
    const startedAt = useRef(Date.now())
    const done = useRef(false)
    const latest = useRef(props)
    latest.current = props
    const onFinish = useCallback((msg?: string) => {
      if (done.current) return // a game finishes once: record once, tell the shell once
      done.current = true
      const { settings, onFinish: next } = latest.current
      void recordPlay({ gameId, age: settings.age, durationMs: Date.now() - startedAt.current, completed: true })
      next(msg)
    }, [])
    return <Game {...props} onFinish={onFinish} />
  }
  Recorded.displayName = `Recorded(${gameId})`
  return Recorded
}
