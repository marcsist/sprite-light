import { useEffect, useState } from 'react'
import { VARIANTS, type VariantName, type Pixels } from './variants'

const ALL_VARIANT_NAMES = VARIANTS.map((v) => v.name)

function resolveVariant(name: VariantName) {
  const found = VARIANTS.find((v) => v.name === name)
  if (!found) {
    console.warn(`[ThinkingSprite] Unknown variant "${name}". Falling back to EKG.`)
    return VARIANTS[0]
  }
  return found
}

export interface ThinkingSpriteProps {
  /** Side length in pixels. The SVG scales to any size; viewBox stays 8×8. Default: 16 */
  size?: number
  /** Lock to a single variant by name. Disables click/keyboard cycling when set. */
  variant?: VariantName
  /** Subset of variants to cycle through. Ignored when `variant` is set. Cycles all 20 when omitted. */
  variants?: VariantName[]
  /** When false, animation freezes on the current frame at the same opacity. Default: true */
  active?: boolean
  /**
   * Fill color(s) for lit pixels.
   * - Single string → applies to all lit pixels; unlit pixels are not rendered.
   * - Tuple `[primary, dim]` → LED matrix mode: all 64 cells render, dim for unlit, primary for lit.
   * - Omitted → `currentColor` (inherits from CSS).
   */
  color?: string | [string, string]
  /** Milliseconds per animation tick. Lower = faster. Default: 90 */
  speed?: number
  /** Pixel shape. 'dot' renders round circles with lite-brite spacing. Default: 'square' */
  shape?: 'square' | 'dot'
  /** Radius of each dot in SVG units (0–0.5). Only used when shape='dot'. Default: 0.38 */
  dotRadius?: number
}

export function ThinkingSprite({
  size = 16,
  variant,
  variants,
  active = true,
  color,
  speed = 90,
  shape = 'square',
  dotRadius = 0.38,
}: ThinkingSpriteProps) {
  const [tick, setTick] = useState(0)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((t) => t + 1), speed)
    return () => clearInterval(id)
  }, [active, speed])

  // Resolve which variant entry to render
  let entry: { name: VariantName; render: (tick: number) => Pixels }
  if (variant !== undefined) {
    entry = resolveVariant(variant)
  } else {
    const pool = resolvePool(variants)
    const poolEntry = VARIANTS.find((v) => v.name === pool[idx % pool.length])
    entry = poolEntry ?? VARIANTS[0]
  }

  const { name, render } = entry
  const litPixels = render(tick)

  // Build a Set for O(1) lookup in LED matrix mode
  const litSet = new Set(litPixels.map(([x, y]) => `${x},${y}`))

  // Color resolution
  const isLedMode = Array.isArray(color) && color.length >= 2
  const primaryColor = isLedMode
    ? (color as [string, string])[0]
    : typeof color === 'string'
      ? color
      : 'currentColor'
  const dimColor = isLedMode ? (color as [string, string])[1] : undefined

  const isInteractive = variant === undefined

  function handleClick() {
    if (!isInteractive) return
    const pool = resolvePool(variants)
    setIdx((i) => (i + 1) % pool.length)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isInteractive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const pool = resolvePool(variants)
      setIdx((i) => (i + 1) % pool.length)
    }
  }

  const needsPadding = isInteractive && size < 36

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      role={isInteractive ? 'button' : 'img'}
      aria-label={`${active ? 'Thinking' : 'Paused'}: ${name}`}
      tabIndex={isInteractive ? 0 : -1}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      style={{
        imageRendering: shape === 'dot' ? undefined : 'pixelated',
        display: 'block',
        flexShrink: 0,
        cursor: isInteractive ? 'pointer' : 'default',
        padding: needsPadding ? '4px' : undefined,
        boxSizing: needsPadding ? 'content-box' : undefined,
      }}
    >
      <title>{name}</title>
      {isLedMode
        ? ALL_CELLS.map(([x, y]) =>
            shape === 'dot' ? (
              <circle
                key={`${x},${y}`}
                cx={x + 0.5}
                cy={y + 0.5}
                r={dotRadius}
                fill={litSet.has(`${x},${y}`) ? primaryColor : dimColor}
              />
            ) : (
              <rect
                key={`${x},${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={litSet.has(`${x},${y}`) ? primaryColor : dimColor}
              />
            )
          )
        : litPixels.map(([x, y], i) =>
            shape === 'dot' ? (
              <circle key={i} cx={x + 0.5} cy={y + 0.5} r={dotRadius} fill={primaryColor} />
            ) : (
              <rect key={i} x={x} y={y} width={1} height={1} fill={primaryColor} />
            )
          )}
    </svg>
  )
}

// All 64 cells for LED matrix mode
const ALL_CELLS: Pixels = Array.from({ length: 64 }, (_, i) => [i % 8, Math.floor(i / 8)])

function resolvePool(variantNames: VariantName[] | undefined): VariantName[] {
  if (!variantNames) return ALL_VARIANT_NAMES
  const valid: VariantName[] = []
  for (const name of variantNames) {
    if (ALL_VARIANT_NAMES.includes(name)) {
      valid.push(name)
    } else {
      console.warn(`[ThinkingSprite] Unknown variant "${name}" in variants array — skipping.`)
    }
  }
  return valid.length > 0 ? valid : ALL_VARIANT_NAMES
}
