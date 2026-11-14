let current = 1

/** Current #app scale (original global SC). */
export const getScale = (): number => current

export function fit(): { sc: number; dw: number; dh: number } {
  const base = 760
  let sc = innerHeight / base
  const minW = innerHeight > innerWidth ? 720 : 1060
  if (innerWidth / sc < minW) sc = innerWidth / minW
  current = sc
  const dw = innerWidth / sc
  const dh = innerHeight / sc
  const app = document.getElementById('app')
  if (app) {
    app.style.width = dw + 'px'
    app.style.height = dh + 'px'
    app.style.transform = `scale(${sc})`
  }
  const root = document.documentElement.style
  root.setProperty('--sc', String(sc))
  root.setProperty('--vw', dw / 100 + 'px')
  root.setProperty('--vh', dh / 100 + 'px')
  return { sc, dw, dh }
}

export function installFit(): () => void {
  fit()
  let t: ReturnType<typeof setTimeout> | undefined
  const onOrient = () => { t = setTimeout(fit, 200) }
  addEventListener('resize', fit)
  addEventListener('orientationchange', onOrient)
  return () => {
    clearTimeout(t)
    removeEventListener('resize', fit)
    removeEventListener('orientationchange', onOrient)
  }
}
