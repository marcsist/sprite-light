import { useEffect, useMemo, useState } from 'react'
import type { Pixels } from './variants'

// ── 3×5 pixel font — each glyph is 5 rows, 3 bits per row (bit2=col0, bit0=col2) ──
const FONT: Record<string, number[]> = {
  A: [2, 5, 7, 5, 5],  B: [6, 5, 6, 5, 6],  C: [3, 4, 4, 4, 3],
  D: [6, 5, 5, 5, 6],  E: [7, 4, 6, 4, 7],  F: [7, 4, 6, 4, 4],
  G: [3, 4, 5, 5, 3],  H: [5, 5, 7, 5, 5],  I: [7, 2, 2, 2, 7],
  J: [1, 1, 1, 5, 2],  K: [5, 6, 4, 6, 5],  L: [4, 4, 4, 4, 7],
  M: [5, 7, 7, 5, 5],  N: [5, 7, 5, 5, 5],  O: [2, 5, 5, 5, 2],
  P: [6, 5, 6, 4, 4],  Q: [2, 5, 5, 5, 3],  R: [6, 5, 6, 5, 5],
  S: [3, 4, 2, 1, 6],  T: [7, 2, 2, 2, 2],  U: [5, 5, 5, 5, 2],
  V: [5, 5, 5, 3, 2],  W: [5, 7, 5, 7, 5],  X: [5, 5, 2, 5, 5],
  Y: [5, 5, 2, 2, 2],  Z: [7, 1, 2, 4, 7],
  '0': [7, 5, 5, 5, 7], '1': [2, 6, 2, 2, 7], '2': [6, 1, 2, 4, 7],
  '3': [6, 1, 2, 1, 6], '4': [5, 5, 7, 1, 1], '5': [7, 4, 6, 1, 6],
  '6': [2, 4, 6, 5, 2], '7': [7, 1, 2, 2, 2], '8': [2, 5, 2, 5, 2],
  '9': [2, 5, 3, 1, 2],
  ' ': [0, 0, 0, 0, 0], '!': [2, 2, 2, 0, 2], '?': [6, 1, 2, 0, 2],
  '.': [0, 0, 0, 0, 2],
}

// Character glyph origin — centered in 8×8 grid
const OX = 2  // cols 2,3,4
const OY = 1  // rows 1–5

const CHAR_TICKS = 24  // ticks per character (~2.2s at 90ms/tick)
const SWEEP = 8        // ticks for sweep-in and sweep-out phases

// Precomputed per-character pixel positions and distances from center.
// Avoids Math.sqrt on every animation tick — distances are static per glyph.
type PixelData = { x: number; y: number; dist: number }
const CX = OX + 1.5
const CY = OY + 2.5
const MAX_DIST = 2.5

const CHAR_PIXELS: Record<string, PixelData[]> = {}
for (const [char, rows] of Object.entries(FONT)) {
  const pixels: PixelData[] = []
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      if (!(rows[r] & (4 >> c))) continue
      const x = OX + c
      const y = OY + r
      pixels.push({ x, y, dist: Math.sqrt((x - CX) ** 2 + (y - CY) ** 2) })
    }
  }
  CHAR_PIXELS[char] = pixels
}

// Accepts pre-parsed chars array to avoid text processing on every tick.
function renderWrite(tick: number, chars: string[]): Pixels {
  if (chars.length === 0) return []

  const t = tick % (chars.length * CHAR_TICKS)
  const ci = Math.floor(t / CHAR_TICKS)
  const ct = t % CHAR_TICKS
  const pixels: Pixels = []

  const phase = ct < SWEEP ? 'in' : ct < SWEEP * 2 ? 'hold' : 'out'
  const progress = phase === 'in' ? ct / SWEEP : phase === 'out' ? (ct - SWEEP * 2) / SWEEP : 1

  for (const { x, y, dist } of CHAR_PIXELS[chars[ci]]) {
    if (phase === 'hold') {
      pixels.push([x, y])
    } else {
      const threshold = phase === 'in' ? progress * MAX_DIST : (1 - progress) * MAX_DIST
      if (dist <= threshold) pixels.push([x, y])
    }
  }

  // Cursor dot blinks during hold
  if (phase === 'hold' && (ct - SWEEP) % 4 < 2) {
    pixels.push([OX + 1, 7])
  }

  return pixels
}

const ALL_CELLS: Pixels = Array.from({ length: 64 }, (_, i) => [i % 8, Math.floor(i / 8)])

export interface WriteSpriteProps {
  /** Text to spell out letter by letter. Default: 'HELLO' */
  text?: string
  /** Side length in pixels. The SVG scales to any size; viewBox stays 8×8. Default: 16 */
  size?: number
  /** Milliseconds per animation tick. Lower = faster. Default: 90 */
  speed?: number
  /** When false, animation freezes on the current frame. Default: true */
  active?: boolean
  /**
   * Fill color(s) for lit pixels.
   * - Single string → applies to all lit pixels; unlit pixels are not rendered.
   * - Tuple `[primary, dim]` → LED matrix mode: all 64 cells render.
   * - Omitted → `currentColor`.
   */
  color?: string | [string, string]
}

export function WriteSprite({
  text = 'HELLO',
  size = 16,
  speed = 90,
  active = true,
  color,
}: WriteSpriteProps) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((t) => t + 1), speed)
    return () => clearInterval(id)
  }, [active, speed])

  // Reset animation cycle when text changes
  useEffect(() => {
    setTick(0)
  }, [text])

  // Parse text once per prop change, not on every tick
  const chars = useMemo(
    () => text.toUpperCase().split('').filter((c) => c in FONT),
    [text]
  )

  const litPixels = renderWrite(tick, chars)
  const litMap = new Uint8Array(64)
  for (const [x, y] of litPixels) litMap[y * 8 + x] = 1

  const isLedMode = Array.isArray(color) && color.length >= 2
  const primaryColor = isLedMode
    ? (color as [string, string])[0]
    : typeof color === 'string'
      ? color
      : 'currentColor'
  const dimColor = isLedMode ? (color as [string, string])[1] : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      role="img"
      aria-label={`Writing: ${text}`}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
    >
      {isLedMode
        ? ALL_CELLS.map(([x, y]) => (
            <rect
              key={`${x},${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={litMap[y * 8 + x] ? primaryColor : dimColor}
            />
          ))
        : litPixels.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={1} height={1} fill={primaryColor} />
          ))}
    </svg>
  )
}
