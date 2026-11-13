/** Original flash(el, cls): restart a one-shot CSS animation class (pop / nope). */
export function flash(el: Element | null | undefined, cls: string): void {
  if (!el) return
  el.classList.remove(cls)
  void (el as HTMLElement).offsetWidth
  el.classList.add(cls)
}

/** Original attn(el, on): toggle the pulsing "press me" highlight. */
export function attn(el: Element | null | undefined, on: boolean): void {
  el?.classList.toggle('attn', !!on)
}

/** element.animate guarded like the original's try/catch (jsdom and old browsers lack it). */
export function anim(el: Element | null | undefined, frames: Keyframe[], opts: number | KeyframeAnimationOptions): void {
  try { el?.animate(frames, opts) } catch { /* unsupported */ }
}

/** Centre of an element in viewport pixels (original ctr()). */
export function center(el: Element): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}
