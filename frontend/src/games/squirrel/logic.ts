/** Original spin: at least two full turns, ending on the middle of sector r (r*120+60 degrees). */
export function spinAngle(angle: number, r: number): number {
  const target = r * 120 + 60
  return angle + 720 + (((target - (angle % 360)) + 360) % 360)
}
