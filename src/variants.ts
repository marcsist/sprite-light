export type Pixels = Array<[number, number]>

export type VariantName =
  | 'EKG' | 'Rain' | 'Snake' | 'Bounce' | 'Sine' | 'Scan' | 'Binary' | 'Morse'
  | 'Weave' | 'Spark' | 'Spiral' | 'Pulse' | 'DNA' | 'Pendulum' | 'Glitch'
  | 'Orbit' | 'Life' | 'Stairs' | 'Bars' | 'Spin'

const cl = (v: number) => Math.min(7, Math.max(0, v))

// ── EKG: scrolling heartbeat with baseline breath ─────────────────────────
const EKG_WAVE = [3, 3, 3, 1, 0, 6, 4, 3]
function renderEkg(tick: number): Pixels {
  const scroll = tick % 8
  const breath = Math.round(Math.sin((tick / 20) * Math.PI * 2))
  return Array.from({ length: 8 }, (_, col) => [col, cl(EKG_WAVE[(col + scroll) % 8] + breath)])
}

// ── Rain: droplets falling in staggered columns ───────────────────────────
const RAIN_DROPS = [{ col: 0, phase: 0 }, { col: 2, phase: 3 }, { col: 5, phase: 6 }, { col: 7, phase: 1 }]
function renderRain(tick: number): Pixels {
  const step = Math.floor(tick / 2)
  return RAIN_DROPS.flatMap(({ col, phase }) => {
    const row = (step + phase) % 8
    return [[col, row], [col, (row - 1 + 8) % 8]] as Pixels
  })
}

// ── Snake: 3-pixel worm tracing a rectangular loop ────────────────────────
const SNAKE_PATH: Pixels = [
  ...[1, 2, 3, 4, 5, 6].map((x) => [x, 1] as [number, number]),
  ...[2, 3, 4, 5, 6].map((y) => [6, y] as [number, number]),
  ...[5, 4, 3, 2, 1].map((x) => [x, 6] as [number, number]),
  ...[5, 4, 3, 2].map((y) => [1, y] as [number, number]),
]
function renderSnake(tick: number): Pixels {
  const n = SNAKE_PATH.length
  return [0, 1, 2].map((i) => SNAKE_PATH[(tick + i) % n])
}

// ── Bounce: single pixel on a diagonal reflect path ───────────────────────
const BOUNCE_PATH: Pixels = [
  [0, 4], [1, 5], [2, 6], [3, 7], [4, 6], [5, 5], [6, 4], [7, 3],
  [6, 2], [5, 1], [4, 0], [3, 1], [2, 2], [1, 3],
]
function renderBounce(tick: number): Pixels {
  return [BOUNCE_PATH[tick % BOUNCE_PATH.length]]
}

// ── Sine: smooth scrolling sine wave ─────────────────────────────────────
function renderSine(tick: number): Pixels {
  const scroll = tick % 8
  return Array.from({ length: 8 }, (_, col) => {
    const t = ((col + scroll) / 8) * Math.PI * 2
    return [col, cl(Math.round(3.5 + 2.5 * Math.sin(t)))]
  })
}

// ── Scan: diagonal scanline sweeping across the grid ─────────────────────
function renderScan(tick: number): Pixels {
  const d = (tick % 15) - 7
  const pixels: Pixels = []
  for (let col = 0; col < 8; col++) {
    const row = col - d
    if (row >= 0 && row < 8) pixels.push([col, row])
  }
  return pixels
}

// ── Binary: 8-bit counter displayed as high/low pixels per column ─────────
function renderBinary(tick: number): Pixels {
  const n = Math.floor(tick / 2) % 256
  return Array.from({ length: 8 }, (_, bit) => [bit, (n >> (7 - bit)) & 1 ? 2 : 5])
}

// ── Morse: SOS scrolling across row 3 ────────────────────────────────────
const MORSE_SOS = [1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0]
function renderMorse(tick: number): Pixels {
  const pixels: Pixels = []
  for (let col = 0; col < 8; col++) {
    if (MORSE_SOS[(col + tick) % MORSE_SOS.length]) pixels.push([col, 3])
  }
  return pixels
}

// ── Weave: two sine waves scrolling in opposite directions ────────────────
function renderWeave(tick: number): Pixels {
  const pixels: Pixels = []
  for (let col = 0; col < 8; col++) {
    const t1 = ((col + tick) / 8) * Math.PI * 2
    const t2 = ((col - tick) / 8) * Math.PI * 2
    pixels.push([col, cl(Math.round(2 + 1.5 * Math.sin(t1)))])
    pixels.push([col, cl(Math.round(5 + 1.5 * Math.sin(t2)))])
  }
  return pixels
}

// ── Spark: 3 pixels on distinct pseudo-random deterministic paths ─────────
function renderSpark(tick: number): Pixels {
  return [
    [(tick * 5) % 8,     (tick * 3 + 2) % 8],
    [(tick * 3 + 3) % 8, (tick * 7 + 5) % 8],
    [(tick * 7 + 1) % 8, (tick * 5 + 6) % 8],
  ]
}

// ── Spiral: single pixel + trail tracing a clockwise inward spiral ────────
function generateSpiral(): Pixels {
  const visited = Array.from({ length: 8 }, () => new Array(8).fill(false))
  const path: Pixels = []
  const dirs: Array<[number, number]> = [[1, 0], [0, 1], [-1, 0], [0, -1]]
  let x = 0, y = 0, dir = 0
  for (let i = 0; i < 64; i++) {
    path.push([x, y])
    visited[y][x] = true
    const [dx, dy] = dirs[dir]
    const nx = x + dx, ny = y + dy
    if (nx < 0 || nx >= 8 || ny < 0 || ny >= 8 || visited[ny][nx]) {
      dir = (dir + 1) % 4
      x += dirs[dir][0]
      y += dirs[dir][1]
    } else {
      x = nx; y = ny
    }
  }
  return path
}
const SPIRAL_PATH = generateSpiral()
function renderSpiral(tick: number): Pixels {
  const n = SPIRAL_PATH.length
  return [SPIRAL_PATH[tick % n], SPIRAL_PATH[(tick + 1) % n]]
}

// ── Pulse: diamond ring expanding from center then contracting ────────────
function renderPulse(tick: number): Pixels {
  const phase = tick % 8
  const r = phase < 4 ? phase : 7 - phase
  const pixels: Pixels = []
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (Math.abs(x - 3) + Math.abs(y - 3) === r) pixels.push([x, y])
    }
  }
  return pixels
}

// ── DNA: two sine strands 180° apart scrolling horizontally ──────────────
function renderDNA(tick: number): Pixels {
  const pixels: Pixels = []
  for (let col = 0; col < 8; col++) {
    const t = ((col + tick) / 8) * Math.PI * 2
    pixels.push([col, cl(Math.round(3.5 + 2.5 * Math.sin(t)))])
    pixels.push([col, cl(Math.round(3.5 + 2.5 * Math.sin(t + Math.PI)))])
  }
  return pixels
}

// ── Pendulum: line swinging from top pivot ────────────────────────────────
function renderPendulum(tick: number): Pixels {
  const angle = (Math.PI / 4.5) * Math.sin((tick / 20) * Math.PI * 2)
  const pixels: Pixels = []
  for (let i = 1; i <= 5; i++) {
    pixels.push([cl(Math.round(3 + i * Math.sin(angle))), cl(Math.round(i * Math.cos(angle)))])
  }
  return pixels
}

// ── Glitch: one pixel per row jumping via shader-style hash ───────────────
function renderGlitch(tick: number): Pixels {
  return Array.from({ length: 8 }, (_, row) => {
    const h = Math.sin(row * 127.1 + tick * 43.7) * 43758.5453
    return [Math.abs(Math.floor(h % 8)), row]
  })
}

// ── Orbit: 3-pixel trail on a flattened ellipse around center ────────────
function renderOrbit(tick: number): Pixels {
  const cx = 3.5, cy = 3.5, rx = 3, ry = 1.5
  const base = (tick / 24) * Math.PI * 2
  return [0, 1, 2].map((i) => {
    const a = base - i * 0.5
    return [cl(Math.round(cx + rx * Math.cos(a))), cl(Math.round(cy + ry * Math.sin(a)))]
  })
}

// ── Life: glider (2 alternating shapes) drifting diagonally, wrapping ────
const GLIDER_A: Pixels = [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]]
const GLIDER_B: Pixels = [[2, 0], [0, 1], [2, 1], [1, 2], [2, 2]]
function renderLife(tick: number): Pixels {
  const step = Math.floor(tick / 4)
  const shape = step % 2 === 0 ? GLIDER_A : GLIDER_B
  const d = Math.floor(step / 2)
  return shape.map(([x, y]) => [(x + d) % 8, (y + d) % 8])
}

// ── Stairs: 2-pixel trail climbing a staircase then falling back ──────────
const STAIRS_PATH: Pixels = [
  [0, 7], [1, 7], [1, 6], [2, 6], [2, 5], [3, 5], [3, 4], [4, 4],
  [4, 3], [5, 3], [5, 2], [6, 2], [6, 1], [7, 1], [7, 0],
  [6, 1], [6, 2], [5, 2], [5, 3], [4, 3], [4, 4], [3, 4], [3, 5],
  [2, 5], [2, 6], [1, 6], [1, 7], [0, 7],
]
function renderStairs(tick: number): Pixels {
  const n = STAIRS_PATH.length
  return [0, 1].map((i) => STAIRS_PATH[(tick + i) % n])
}

// ── Bars: audio equalizer with 8 sin-driven columns ──────────────────────
function renderBars(tick: number): Pixels {
  const pixels: Pixels = []
  for (let col = 0; col < 8; col++) {
    const h = Math.round(1 + 3.5 * (0.5 + 0.5 * Math.sin((tick / 12 + col * 0.7) * Math.PI * 2)))
    for (let row = 7; row >= 8 - h; row--) pixels.push([col, row])
  }
  return pixels
}

// ── Spin: 8-pixel line through center rotating 4 positions ───────────────
const SPIN_FRAMES: Pixels[] = [
  Array.from({ length: 8 }, (_, i) => [3, i]),     // |
  Array.from({ length: 8 }, (_, i) => [i, i]),     // \
  Array.from({ length: 8 }, (_, i) => [i, 3]),     // —
  Array.from({ length: 8 }, (_, i) => [i, 7 - i]), // /
]
function renderSpin(tick: number): Pixels {
  return SPIN_FRAMES[Math.floor(tick / 6) % 4]
}

// ── Variant registry ──────────────────────────────────────────────────────
export const VARIANTS: Array<{ name: VariantName; render: (tick: number) => Pixels }> = [
  { name: 'EKG',      render: renderEkg      },
  { name: 'Rain',     render: renderRain     },
  { name: 'Snake',    render: renderSnake    },
  { name: 'Bounce',   render: renderBounce   },
  { name: 'Sine',     render: renderSine     },
  { name: 'Scan',     render: renderScan     },
  { name: 'Binary',   render: renderBinary   },
  { name: 'Morse',    render: renderMorse    },
  { name: 'Weave',    render: renderWeave    },
  { name: 'Spark',    render: renderSpark    },
  { name: 'Spiral',   render: renderSpiral   },
  { name: 'Pulse',    render: renderPulse    },
  { name: 'DNA',      render: renderDNA      },
  { name: 'Pendulum', render: renderPendulum },
  { name: 'Glitch',   render: renderGlitch   },
  { name: 'Orbit',    render: renderOrbit    },
  { name: 'Life',     render: renderLife     },
  { name: 'Stairs',   render: renderStairs   },
  { name: 'Bars',     render: renderBars     },
  { name: 'Spin',     render: renderSpin     },
]
