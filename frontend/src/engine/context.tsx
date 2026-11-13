import { createContext, useContext, type ReactNode } from 'react'
import type { Engine } from './index'

const Ctx = createContext<Engine | null>(null)

export function EngineProvider({ engine, children }: { engine: Engine; children: ReactNode }) {
  return <Ctx.Provider value={engine}>{children}</Ctx.Provider>
}

export function useEngine(): Engine {
  const e = useContext(Ctx)
  if (!e) throw new Error('EngineProvider missing')
  return e
}
