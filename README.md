# sprite-light

Zero-dependency 8×8 pixel-art animation component for React.

## Quick start

```tsx
// Bare — cycles all 20 variants on click
<ThinkingSprite />

// Fixed variant — no cycling
<ThinkingSprite variant="DNA" />

// Subset cycling — cycles only these three on click/Enter/Space
<ThinkingSprite variants={["EKG", "DNA", "Pulse"]} />

// LED matrix mode — dim background + lit color
<ThinkingSprite variant="DNA" color={["#00ff88", "#1a2a1a"]} size={48} />

// Paused — freezes on current frame
<ThinkingSprite active={false} />
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `number` | `16` | Side length in px. SVG scales to any size; viewBox stays 8×8. |
| `variant` | `VariantName` | — | Lock to a single variant. Disables cycling when set. |
| `variants` | `VariantName[]` | — | Subset to cycle through. Ignored when `variant` is set. |
| `active` | `boolean` | `true` | When `false`, animation freezes on the current frame. |
| `color` | `string \| [string, string]` | `currentColor` | Single color for lit pixels, or `[primary, dim]` for LED matrix mode. |
| `speed` | `number` | `90` | Milliseconds per animation tick. Lower = faster. |

## Variants

| Name | Animation |
|---|---|
| EKG | Scrolling heartbeat with baseline breath |
| Rain | Droplets falling in staggered columns |
| Snake | 3-pixel worm tracing a rectangular loop |
| Bounce | Single pixel on a diagonal reflect path |
| Sine | Smooth scrolling sine wave |
| Scan | Diagonal scanline sweeping across the grid |
| Binary | 8-bit counter displayed as high/low pixels per column |
| Morse | SOS scrolling across row 3 |
| Weave | Two sine waves scrolling in opposite directions |
| Spark | 3 pixels on distinct pseudo-random deterministic paths |
| Spiral | Single pixel + trail tracing a clockwise inward spiral |
| Pulse | Diamond ring expanding from center then contracting |
| DNA | Two sine strands 180° apart scrolling horizontally |
| Pendulum | Line swinging from top pivot |
| Glitch | One pixel per row jumping via shader-style hash |
| Orbit | 3-pixel trail on a flattened ellipse around center |
| Life | Glider drifting diagonally, wrapping |
| Stairs | 2-pixel trail climbing a staircase then falling back |
| Bars | Audio equalizer with 8 sin-driven columns |
| Spin | 8-pixel line through center rotating 4 positions |

## LED matrix mode

When `color` is a tuple, all 64 grid cells render — dim for unlit, primary for lit. This gives a classic LED display effect.

```tsx
<ThinkingSprite
  variant="DNA"
  size={64}
  color={["#00ff88", "#0a1a0a"]}
/>
```

<!-- Screenshot placeholder -->

## TypeScript

`VariantName` is exported for autocomplete and type safety:

```tsx
import { ThinkingSprite, type VariantName } from 'sprite-light'

const myVariant: VariantName = 'DNA' // autocompletes all 20 names
```
