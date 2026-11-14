export const spriteUrl = (name: string) => `${import.meta.env.BASE_URL}sprites/${name}.png`

export function Sprite({ name, size, alt = '' }: { name: string; size: number; alt?: string }) {
  return (
    <img
      src={spriteUrl(name)}
      alt={alt}
      draggable={false}
      style={{ width: size, height: size, objectFit: 'contain', pointerEvents: 'none' }}
    />
  )
}
