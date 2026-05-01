export type Pixels = Array<[number, number]>

export type VariantName =
  | 'EKG' | 'Rain' | 'Snake' | 'Bounce' | 'Sine' | 'Scan' | 'Binary' | 'Morse'
  | 'Weave' | 'Spark' | 'Spiral' | 'Pulse' | 'DNA' | 'Pendulum' | 'Glitch'
  | 'Orbit' | 'Life' | 'Stairs' | 'Bars' | 'Spin' | 'Ghost'
  | 'Breath' | 'Drip' | 'Bubble'
  | 'Hourglass' | 'Ripple' | 'Tide' | 'Signal' | 'Focus'
  | 'Campfire' | 'Firefly' | 'Bloom' | 'Flutter' | 'Aurora' | 'Surf'
  | 'Invader' | 'Pac' | 'Pong' | 'Neko' | 'Worm' | 'Face' | 'TabulaRasa'
  | 'Tamagotchi'
  | 'Cursor' | 'Arc' | 'Neural' | 'Think' | 'Loader' | 'Radar'
  | 'Wave' | 'Cog' | 'Ping' | 'Clock' | 'Step' | 'Fill' | 'Grow'

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

// ── Spin: 8-pixel line through center rotating 8 positions ───────────────
const SPIN_FRAMES: Pixels[] = [
  Array.from({ length: 8 }, (_, i) => [3, i]),          // 0°   |
  [[2,0],[2,1],[3,2],[3,3],[4,4],[4,5],[5,6],[5,7]],     // 22.5°
  Array.from({ length: 8 }, (_, i) => [i, i]),           // 45°  \
  [[0,2],[1,2],[2,3],[3,3],[4,4],[5,4],[6,5],[7,5]],     // 67.5°
  Array.from({ length: 8 }, (_, i) => [i, 3]),           // 90°  —
  [[0,5],[1,5],[2,4],[3,4],[4,3],[5,3],[6,2],[7,2]],     // 112.5°
  Array.from({ length: 8 }, (_, i) => [i, 7 - i]),       // 135° /
  [[5,0],[5,1],[4,2],[4,3],[3,4],[3,5],[2,6],[2,7]],     // 157.5°
]
function renderSpin(tick: number): Pixels {
  return SPIN_FRAMES[Math.floor(tick / 3) % 8]
}

// ── Breath: center diamond expands and contracts like lungs ──────────────────
function renderBreath(tick: number): Pixels {
  const t = (tick / 30) * Math.PI * 2
  const r = Math.round(1.5 + 1.5 * Math.sin(t))   // radius 0..3
  const cx = 3, cy = 3
  const pixels: Pixels = []
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (Math.abs(x - cx) + Math.abs(y - cy) === r) pixels.push([x, y])
    }
  }
  if (r === 0) pixels.push([cx, cy])
  return pixels
}

// ── Drip: pixel forms at top, falls with gravity, splashes at bottom ──────────
function renderDrip(tick: number): Pixels {
  const cycle = 28
  const t = tick % cycle
  if (t < 5) {
    // forming: pixel hangs at top, growing from 1 to 2px
    const px: Pixels = [[3, 0]]
    if (t >= 3) px.push([3, 1])
    return px
  }
  if (t < 18) {
    // falling: quadratic acceleration
    const fall = t - 5
    const y = cl(Math.round(1 + 0.18 * fall * fall))
    return [[3, y]]
  }
  // splash: 3-pixel horizontal spread, fades
  const age = t - 18
  if (age < 5) return [[2, 7], [3, 7], [4, 7]]
  if (age < 8) return [[1, 7], [3, 7], [5, 7]]
  return []
}

// ── Bubble: three dots appear one by one, hold, vanish — the "..." of thinking
function renderBubble(tick: number): Pixels {
  const cycle = 36
  const t = tick % cycle
  const pixels: Pixels = []
  // each dot appears 6 ticks after the previous, holds until t=28, then all pop
  const dots: [number, number][] = [[1, 4], [3, 4], [5, 4]]
  dots.forEach(([x, y], i) => {
    const appear = i * 6
    if (t >= appear && t < 28) pixels.push([x, y])
  })
  return pixels
}

// ── Ghost: favicon sprite floating and wiggling with the breeze ──────────────
const GHOST_ROWS: number[][] = [
  [2, 3, 4, 5],              // row 0: head arc
  [1, 2, 3, 4, 5, 6],        // row 1: head full
  [0, 1, 3, 4, 6, 7],        // row 2: eyes (gaps at 2, 5)
  [0, 1, 2, 3, 4, 5, 6, 7],  // row 3: body
  [0, 1, 2, 3, 4, 5, 6, 7],  // row 4: body
  [0, 2, 3, 4, 5, 7],        // row 5: skirt (gaps at 1, 6)
  [2, 5],                    // row 6: feet
]
function renderGhost(tick: number): Pixels {
  const tSway   = (tick / 28) * Math.PI * 2
  const tBob    = (tick / 18) * Math.PI * 2
  const swayTop = Math.sin(tSway)
  const swayBot = Math.sin(tSway + 1.3)               // hem trails the head
  const dy      = Math.sin(tBob) > 0.2 ? 1 : 0
  const dxTop   = Math.abs(swayTop) > 0.65 ? (swayTop > 0 ? 1 : -1) : 0
  const dxBot   = Math.abs(swayBot) > 0.65 ? (swayBot > 0 ? 1 : -1) : 0
  return GHOST_ROWS.flatMap((xs, row) => {
    const dx = row <= 2 ? dxTop : row >= 5 ? dxBot : 0
    return xs.map((x) => [cl(x + dx), row + dy] as [number, number])
  })
}

// ── Hourglass: sand drains top→bottom, then spins 180° and repeats ───────────
// Four rotation keyframes: 0° → 45° → 90° → 135° → 180°(=0°)
const HG_FRAMES: Pixels[] = [
  // F0: 0° vertical
  [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],
   [0,1],[7,1],[1,2],[6,2],[2,3],[3,3],[4,3],[5,3],
   [2,4],[3,4],[4,4],[5,4],[1,5],[6,5],[0,6],[7,6],
   [0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7]],
  // F1: 45° CW — top cap drifts upper-right, bottom cap lower-left
  [[5,0],[6,0],[7,0],[4,1],[7,1],[3,2],[6,2],
   [2,3],[3,3],[4,3],[3,4],[4,4],[5,4],
   [1,5],[4,5],[0,6],[3,6],[0,7],[1,7],[2,7]],
  // F2: 90° horizontal — caps become left/right vertical bars
  [[0,0],[7,0],[0,1],[1,1],[6,1],[7,1],[0,2],[2,2],[5,2],[7,2],
   [0,3],[3,3],[4,3],[7,3],[0,4],[3,4],[4,4],[7,4],
   [0,5],[2,5],[5,5],[7,5],[0,6],[1,6],[6,6],[7,6],[0,7],[7,7]],
  // F3: 135° CW — top cap drifts lower-right, bottom cap upper-left
  [[0,0],[1,0],[2,0],[0,1],[3,1],[1,2],[4,2],
   [3,3],[4,3],[5,3],[2,4],[3,4],[4,4],
   [3,5],[6,5],[4,6],[7,6],[5,7],[6,7],[7,7]],
]
function renderHourglass(tick: number): Pixels {
  const drainDur = 48
  const rotDur = 20   // 4 frames × 5 ticks each
  const total = drainDur + rotDur
  const t = tick % total
  if (t >= drainDur) {
    // spin: step through the 4 rotation frames
    return [...HG_FRAMES[Math.min(3, Math.floor((t - drainDur) / 5))]]
  }
  const progress = t / drainDur
  const pixels: Pixels = []
  // outline: bars + angled sides + waist
  for (let x = 0; x < 8; x++) { pixels.push([x, 0]); pixels.push([x, 7]) }
  pixels.push([0,1],[7,1],[1,2],[6,2],[1,5],[6,5],[0,6],[7,6])
  pixels.push([2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[5,4])
  // top sand draining (rows 1–2, disappears as progress → 1)
  if (progress < 0.55) for (let x = 1; x <= 6; x++) pixels.push([x, 1])
  if (progress < 0.85) for (let x = 2; x <= 5; x++) pixels.push([x, 2])
  // bottom sand filling (rows 5–6, appears as progress → 1)
  if (progress > 0.15) for (let x = 2; x <= 5; x++) pixels.push([x, 5])
  if (progress > 0.45) for (let x = 1; x <= 6; x++) pixels.push([x, 6])
  // single grain falling through the waist
  pixels.push([3, cl(Math.round(1 + progress * 5))], [4, cl(Math.round(1 + progress * 5))])
  return pixels
}

// ── Ripple: concentric diamond rings expand from center ───────────────────────
function renderRipple(tick: number): Pixels {
  const cx = 3, cy = 3
  // two overlapping ripples, offset by 10 ticks
  const pixels: Pixels = []
  for (const offset of [0, 14]) {
    const r = (tick + offset) % 14
    if (r === 0) { pixels.push([cx, cy]); continue }
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (Math.abs(x - cx) + Math.abs(y - cy) === r) pixels.push([x, y])
      }
    }
  }
  return pixels
}

// ── Tide: water level rises and falls with a scrolling wave crest ─────────────
function renderTide(tick: number): Pixels {
  const level = Math.round(3 + 2.5 * Math.sin((tick / 36) * Math.PI * 2))  // 1..6
  const scroll = tick % 8
  const pixels: Pixels = []
  for (let x = 0; x < 8; x++) {
    // wave crest: every 4 cols the surface is 1 higher
    const crest = Math.round(0.5 + 0.5 * Math.sin(((x + scroll) / 4) * Math.PI * 2))
    const surface = cl(level - crest)
    for (let y = surface; y < 8; y++) pixels.push([x, y])
  }
  return pixels
}

// ── Signal: WiFi-style arcs emanating from bottom-left ───────────────────────
function renderSignal(tick: number): Pixels {
  const period = 28
  const t = tick % period
  const pixels: Pixels = []
  // 3 arcs at radii 2, 4, 6 — each appears for 8 ticks, staggered
  for (let arc = 0; arc < 3; arc++) {
    const start = arc * 6
    const age = t - start
    if (age < 0 || age >= 14) continue
    const r = (arc + 1) * 2
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const d = Math.sqrt(x * x + (7 - y) * (7 - y))
        if (Math.abs(d - r) < 0.7) pixels.push([x, y])
      }
    }
  }
  // origin dot
  pixels.push([0, 7])
  return pixels
}

// ── Focus: scanning beam pauses on a "find", then continues ──────────────────
function renderFocus(tick: number): Pixels {
  const period = 48
  const t = tick % period
  const pixels: Pixels = []
  if (t >= 20 && t < 36) {
    // lock-on: 2x2 reticle with corner brackets at a fixed spot
    const lx = 3, ly = 2
    pixels.push([lx, ly], [lx + 1, ly], [lx, ly + 1], [lx + 1, ly + 1])  // target
    pixels.push([lx - 1, ly - 1], [lx + 2, ly - 1], [lx - 1, ly + 2], [lx + 2, ly + 2])  // corners
  } else {
    // scanning: horizontal sweep line
    const x = t < 20 ? Math.floor((t / 20) * 8) : Math.floor(((t - 36) / 12) * 8)
    pixels.push([cl(x), 2], [cl(x), 3], [cl(x), 4], [cl(x), 5])
  }
  return pixels
}

// ── Campfire: flickering flame at bottom, occasional rising sparks ────────────
function renderCampfire(tick: number): Pixels {
  const pixels: Pixels = []
  // ember base: fixed
  pixels.push([2, 7], [3, 7], [4, 7], [5, 7])
  // flame body: hash-based flicker constrained to flame silhouette
  const flicker = (row: number, col: number) => {
    const h = Math.sin(col * 127.1 + row * 311.7 + tick * 17.3) * 43758.5
    return Math.abs(h % 1) > 0.38
  }
  const flameShape = [
    [3, 4, 5], [2, 3, 4, 5], [3, 4], [3]
  ]
  flameShape.forEach((cols, i) => {
    const y = 6 - i
    cols.forEach((x) => { if (flicker(y, x)) pixels.push([x, y]) })
  })
  // spark: rises every ~12 ticks
  const sparkCycle = tick % 12
  if (sparkCycle < 5) {
    const sparkY = cl(6 - sparkCycle * 1.4 | 0)
    const sparkX = ((tick / 12 | 0) % 3) + 2
    pixels.push([sparkX, sparkY])
  }
  return pixels
}

// ── Firefly: brief flashes at scattered positions, long quiet between ─────────
const FIREFLY_POS: [number, number][] = [[1,1],[6,2],[2,5],[5,6],[0,3],[7,4],[3,7],[4,0]]
const FIREFLY_PHASE = [0, 7, 13, 20, 27, 34, 41, 48]
function renderFirefly(tick: number): Pixels {
  const cycle = 56
  const t = tick % cycle
  return FIREFLY_POS.filter((_, i) => {
    const age = (t - FIREFLY_PHASE[i] + cycle) % cycle
    return age < 3   // on for 3 ticks, off for the rest of the 56-tick cycle
  })
}

// ── Bloom: stem grows, bud forms, petals open, wilts back down ───────────────
function renderBloom(tick: number): Pixels {
  const cycle = 48
  const t = tick % cycle
  const pixels: Pixels = []
  // stem grows to y=2 over first 16 ticks
  const stemTop = cl(7 - Math.floor(t / 2.5))
  for (let y = stemTop; y <= 7; y++) pixels.push([3, y])
  if (t < 16) return pixels
  // bud: 3px cluster at top of stem
  pixels.push([3, 2], [2, 3], [4, 3])
  if (t < 24) return pixels
  // petals open
  const petalAge = t - 24
  if (petalAge > 0) pixels.push([2, 1], [4, 1])
  if (petalAge > 3) pixels.push([1, 2], [5, 2])
  if (petalAge > 6) pixels.push([2, 4], [4, 4])  // lower petals
  if (t < 38) return pixels
  // wilt: reverse
  const wilt = t - 38
  if (wilt < 3) { pixels.push([2, 1], [4, 1], [1, 2], [5, 2], [2, 4], [4, 4]) }
  else if (wilt < 6) { pixels.push([2, 1], [4, 1]) }
  return pixels
}

// ── Flutter: butterfly with flapping wings drifting across ───────────────────
function renderFlutter(tick: number): Pixels {
  const wingFrame = Math.floor(tick / 3) % 4   // 4-frame wing cycle
  const driftX = Math.floor(tick / 8) % 8      // drift across grid
  const cx = driftX, cy = 3
  const pixels: Pixels = []
  // body: 2 pixels
  pixels.push([cl(cx + 1), cy], [cl(cx + 1), cy + 1])
  // wings: fold up/down
  const wingY = [cy - 1, cy, cy + 1, cy + 2][wingFrame]
  pixels.push([cl(cx), wingY], [cl(cx + 2), wingY])
  if (wingFrame < 2) {
    pixels.push([cl(cx - 1), cl(wingY - 1)], [cl(cx + 3), cl(wingY - 1)])
  } else {
    pixels.push([cl(cx - 1), cl(wingY + 1)], [cl(cx + 3), cl(wingY + 1)])
  }
  return pixels
}

// ── Aurora: shimmering vertical columns of varying height ─────────────────────
function renderAurora(tick: number): Pixels {
  const pixels: Pixels = []
  // active columns: 0, 2, 4, 6
  for (let col = 0; col < 8; col += 2) {
    const phase = col * 0.7
    const height = Math.round(2 + 5 * (0.5 + 0.5 * Math.sin((tick / 30 + phase) * Math.PI * 2)))
    for (let row = 8 - height; row < 8; row++) pixels.push([col, row])
    // shimmer tip: extra pixel above column sometimes
    const shimmer = Math.sin((tick / 15 + phase * 1.3) * Math.PI * 2)
    if (shimmer > 0.6) pixels.push([col, cl(8 - height - 1)])
  }
  return pixels
}

// ── Surf: wave rolls in, shoals, crests, breaks, foam settles ─────────────────
// Continuous profile — no discrete phase switches; the wave is always one math expression.
function renderSurf(tick: number): Pixels {
  const cycle = 40
  const t = tick % cycle
  const pixels: Pixels = []
  // sea floor
  for (let x = 0; x < 8; x++) pixels.push([x, 7])
  // crest sweeps from x≈9 (off right) to x≈-3 (off left) over 32 ticks
  const xc = 9 - (t / 32) * 12
  // shoaling: wave grows taller as it nears the shore (x=0)
  const shoaling = Math.max(0, Math.min(1, (8 - xc) / 9))
  const amp = 1 + 4 * shoaling          // 1 px in deep water → 5 px at shore
  // asymmetric profile: steep front face, gradual back slope
  for (let x = 0; x < 8; x++) {
    const d = x - xc
    let factor = 0
    if (d >= 0 && d <= 3.5)    factor = 1 - d / 3.5   // front: steep
    else if (d > -4 && d < 0)  factor = 1 + d / 4     // back:  gentle
    const h = Math.round(Math.max(0, factor) * amp)
    for (let dy = 1; dy <= h; dy++) pixels.push([x, cl(7 - dy)])
  }
  // curl: a spray pixel overhangs the crest once the wave is tall enough
  if (amp >= 3 && xc > 0.5 && xc < 7)
    pixels.push([cl(Math.round(xc) - 1), cl(7 - Math.round(amp) - 1)])
  // foam: scattered surface pixels that dissipate after the wave exits the grid
  if (t >= 32) {
    const age = t - 32
    ;[0, 2, 4, 1, 3].slice(0, Math.max(0, 5 - age)).forEach((x) => pixels.push([x, 6]))
  }
  return pixels
}

// ── Invader: space invader marching side to side with arm toggle ──────────────
const INVADER_A: Pixels = [
  [2,0],[5,0],[3,1],[4,1],[2,2],[3,2],[4,2],[5,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
  [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
  [1,5],[3,5],[4,5],[6,5],
  [2,6],[5,6],
]
const INVADER_B: Pixels = [
  [2,0],[5,0],[3,1],[4,1],[2,2],[3,2],[4,2],[5,2],
  [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],
  [1,4],[2,4],[3,4],[4,4],[5,4],[6,4],
  [2,5],[3,5],[4,5],[5,5],
  [1,6],[3,6],[4,6],[6,6],
]
function renderInvader(tick: number): Pixels {
  const frame = Math.floor(tick / 4) % 2
  const march = Math.floor(tick / 8)
  const dx = march % 6 < 3 ? march % 3 : 2 - (march % 3)   // 0→1→2→1→0
  const base = frame === 0 ? INVADER_A : INVADER_B
  return base.map(([x, y]) => [cl(x + dx - 1), y])
}

// ── Pac: pac-man chomping across the grid, eating dots ────────────────────────
function renderPac(tick: number): Pixels {
  const pixels: Pixels = []
  const pos = tick % 32
  const cx = Math.floor(pos / 4)   // moves right 1px every 4 ticks
  const chomp = (pos % 4) < 2      // mouth open/closed
  // body
  const body: [number, number][] = [
    [0,1],[1,1],[2,1],[0,2],[1,2],[2,2],[0,3],[1,3],[2,3],
    [0,4],[1,4],[2,4],[0,5],[1,5],[2,5],
  ]
  if (!chomp) body.push([1,0],[2,0],[2,6],[1,6])  // top/bottom when closed
  body.forEach(([dx, dy]) => pixels.push([cl(cx + dx - 1), dy]))
  // dots ahead of pac
  for (let d = cx + 3; d < 8; d += 2) pixels.push([d, 3])
  return pixels
}

// ── Pong: ball bouncing between two tracking paddles ──────────────────────────
function renderPong(tick: number): Pixels {
  const pixels: Pixels = []
  // ball: diagonal path
  const bx = tick % 14 < 7 ? tick % 7 + 1 : 7 - (tick % 7)
  const by = tick % 10 < 5 ? tick % 5 + 1 : 5 - (tick % 5) + 1
  pixels.push([cl(bx), cl(by)])
  // paddles: track ball y with 1-tick lag
  const prevBy = (tick - 1) % 10 < 5 ? (tick - 1) % 5 + 1 : 5 - ((tick - 1) % 5) + 1
  for (let dy = -1; dy <= 1; dy++) {
    pixels.push([0, cl(prevBy + dy)])  // left paddle
    pixels.push([7, cl(prevBy + dy)])  // right paddle
  }
  return pixels
}

// ── Neko: sitting cat (side profile) with swishing tail and blink ─────────────
const NEKO_BODY: Pixels = [
  [4,0],[5,0],[4,1],[5,1],[6,1],[4,2],[5,2],[6,2],  // head + ear
  [4,3],[5,3],[6,3],[4,4],[5,4],[6,4],[6,5],         // body
  [4,6],[5,6],[6,6],[4,7],[5,7],[6,7],               // haunches + feet
]
function renderNeko(tick: number): Pixels {
  const pixels: Pixels = [...NEKO_BODY]
  // eye: row 2 col 5 — blink every 30 ticks
  if (tick % 30 >= 2) pixels.push([5, 2])  // eye open except 2-tick blink
  // tail: swishes from x=1..3 at rows 5-7
  const tailAngle = Math.sin((tick / 20) * Math.PI * 2)
  const tx = cl(Math.round(2 + tailAngle * 1.2))
  pixels.push([tx, 5], [cl(tx - 1), 6], [cl(tx - 2), 7])
  return pixels
}

// ── Worm: 5-segment creature undulating via delayed head trail ─────────────────
function renderWorm(tick: number): Pixels {
  const delay = 4
  const headPath = (t: number): [number, number] => {
    const x = Math.round(3.5 + 3 * Math.sin((t / 24) * Math.PI * 2))
    const y = Math.round(3.5 + 2 * Math.sin((t / 16) * Math.PI * 2))
    return [cl(x), cl(y)]
  }
  return [0, 1, 2, 3, 4].map((seg) => headPath(tick - seg * delay))
}

// ── Face: smiley that blinks and shifts expression subtly ─────────────────────
function renderFace(tick: number): Pixels {
  const blinking = tick % 28 < 2
  const happy = Math.floor(tick / 40) % 3 === 1
  const thinking = Math.floor(tick / 40) % 3 === 2
  const pixels: Pixels = [
    // outline circle
    [2,0],[3,0],[4,0],[5,0],
    [1,1],[6,1],[0,2],[7,2],[0,3],[7,3],[0,4],[7,4],[0,5],[7,5],
    [1,6],[6,6],[2,7],[3,7],[4,7],[5,7],
  ]
  // eyes
  if (!blinking) {
    pixels.push([2,2],[5,2])
    if (thinking) pixels.push([3,2])  // squint
  } else {
    pixels.push([2,3],[5,3])  // closed eyes lower
  }
  // mouth
  if (happy) {
    pixels.push([2,5],[3,5],[4,5],[5,5],[1,4],[6,4])
  } else if (thinking) {
    pixels.push([2,5],[3,5],[4,5])
  } else {
    pixels.push([2,5],[3,5],[4,5],[5,5])
  }
  return pixels
}

// ── TabulaRasa: placeholder-text lines, sweep clean, repeat ──────────────
function renderTabulaRasa(tick: number): Pixels {
  // Every other row active; each row has word-like dash groups with gaps.
  // Rows 0,2,4,6 only — rows 1,3,5,7 stay blank (breathing room).
  const CONTENT: [number, number][] = [
    // row 0: short word · long word
    [0,0],[1,0],[2,0],           [4,0],[5,0],[6,0],[7,0],
    // row 2: long word · short word
    [0,2],[1,2],[2,2],[3,2],[4,2],     [6,2],[7,2],
    // row 4: short word · medium word
    [0,4],[1,4],       [3,4],[4,4],[5,4],[6,4],
    // row 6: medium word · medium word
    [0,6],[1,6],[2,6],[3,6],     [5,6],[6,6],[7,6],
  ]

  const WRITE = CONTENT.length  // one pixel per tick
  const HOLD  = 10
  const WIPE  = 16
  const CYCLE = WRITE + HOLD + WIPE

  const t   = tick % CYCLE
  const dir = Math.floor(tick / CYCLE) % 4  // 0=L→R 1=R→L 2=T→B 3=B→T

  if (t < WRITE) {
    return CONTENT.slice(0, t + 1)
  } else if (t < WRITE + HOLD) {
    return [...CONTENT]
  } else {
    const edge = Math.floor(((t - WRITE - HOLD) + 1) / WIPE * 8)
    return CONTENT.filter(([x, y]) =>
      dir === 0 ? x >= edge
    : dir === 1 ? x < 8 - edge
    : dir === 2 ? y >= edge
    :             y < 8 - edge
    )
  }
}

// ── Tamagotchi: round pixel pet drifting side-to-side, blinking, walking ──
const TAMA_BODY: Pixels = [
  [3,0],                                 // hair tuft
  [2,1],[3,1],[4,1],                     // head top
  [1,2],[2,2],[3,2],[4,2],[5,2],         // head widest
  [1,3],[5,3],                           // face sides (eye dots at [2,3],[4,3] added separately)
  [1,4],[5,4],                           // face sides lower (mouth dot at [3,4] added separately)
  [2,5],[3,5],[4,5],                     // chin
  [3,6],[4,6],                           // body stub
]
function renderTamagotchi(tick: number): Pixels {
  // side-to-side drift: dx 0..2 via sine, ~5.7 s per cycle
  const dx = Math.round(1 + Math.sin((tick / 32) * Math.PI * 2))
  // walking feet: alternate wide/narrow every 8 ticks
  const foot = Math.floor(tick / 8) % 2
  // blink: 2-tick window every 40 ticks
  const blink = tick % 40 < 2
  // happy grin: last phase of a 4-phase 40-tick cycle
  const happy = Math.floor(tick / 40) % 4 === 3

  const pixels: Pixels = TAMA_BODY.map(([x, y]) => [cl(x + dx), y])

  // eyes (open = lit dots; blink = leave dark)
  if (!blink) pixels.push([cl(2 + dx), 3], [cl(4 + dx), 3])

  // mouth (neutral = single dot; happy = wide grin)
  if (happy) {
    pixels.push([cl(2 + dx), 4], [cl(3 + dx), 4], [cl(4 + dx), 4])
  } else {
    pixels.push([cl(3 + dx), 4])
  }

  // feet
  if (foot === 0) {
    pixels.push([cl(2 + dx), 7], [cl(5 + dx), 7])   // wide stance
  } else {
    pixels.push([cl(3 + dx), 7], [cl(4 + dx), 7])   // narrow stance
  }

  return pixels
}

// ── Cursor: blinking I-beam text cursor ──────────────────────────────────
function renderCursor(tick: number): Pixels {
  if ((tick % 16) >= 10) return []
  return [
    [2,1],[3,1],[4,1],
    [3,2],[3,3],[3,4],[3,5],
    [2,6],[3,6],[4,6],
  ]
}

// ── Arc: spinning 3-pixel arc on an 8-point circle — modern loading spinner ─
const ARC_PATH: Pixels = [[3,0],[5,1],[6,3],[5,5],[3,6],[1,5],[0,3],[1,1]]
function renderArc(tick: number): Pixels {
  const n = ARC_PATH.length
  const head = Math.floor(tick / 2) % n
  return [0,1,2].map(i => ARC_PATH[(head + i) % n])
}

// ── Neural: three-node network with a 2-pixel pulse cycling the edges ─────
const NEURAL_NODES: Pixels = [[3,1],[1,6],[6,6]]
const NEURAL_EDGES: Pixels[] = [
  [[2,2],[2,3],[1,4],[1,5]],   // A→B
  [[2,6],[3,6],[4,6],[5,6]],   // B→C
  [[6,5],[5,4],[5,3],[4,2]],   // C→A
]
function renderNeural(tick: number): Pixels {
  const pixels: Pixels = [...NEURAL_NODES]
  const period = 7
  const t = tick % (NEURAL_EDGES.length * period)
  const edgeIdx = Math.floor(t / period)
  const pos = t % period
  const edge = NEURAL_EDGES[edgeIdx]
  if (pos < edge.length) {
    pixels.push(edge[pos])
    if (pos > 0) pixels.push(edge[pos - 1])
  }
  return pixels
}

// ── Think: question mark draws in, holds, morphs into exclamation mark ────
function renderThink(tick: number): Pixels {
  const cycle = 56
  const t = tick % cycle
  if (t < 16) {
    const p: Pixels = []
    if (t >= 0)  p.push([3,1],[4,1])
    if (t >= 4)  p.push([2,2],[5,2])
    if (t >= 8)  p.push([4,3],[5,3])
    if (t >= 11) p.push([3,4])
    if (t >= 14) p.push([3,6])
    return p
  }
  if (t < 28) return [[3,1],[4,1],[2,2],[5,2],[4,3],[5,3],[3,4],[3,6]]
  if (t < 38) {
    const age = t - 28
    const p: Pixels = [[3,1],[3,4],[3,6]]
    if (age < 5)  p.push([4,1],[2,2],[5,2],[4,3],[5,3])
    if (age >= 3) p.push([3,2],[3,3])
    return p
  }
  if (t < 50) {
    const p: Pixels = [[3,1],[3,2],[3,3],[3,4]]
    if ((t % 8) < 6) p.push([3,6])
    return p
  }
  return t < 54 ? [[3,1],[3,2],[3,3],[3,4],[3,6]] : []
}

// ── Loader: left-to-right progress bar fill, hold, reset ─────────────────
function renderLoader(tick: number): Pixels {
  const fill = 36, hold = 8, gap = 8
  const t = tick % (fill + hold + gap)
  if (t >= fill + hold) return []
  const filled = t < fill ? Math.round((t / fill) * 8) : 8
  const pixels: Pixels = []
  for (let x = 0; x < filled; x++) pixels.push([x,3],[x,4])
  return pixels
}

// ── Radar: boundary ring + rotating sweep arm radiating from centre ───────
const RADAR_RING: Pixels = [[3,0],[5,1],[6,3],[5,5],[3,6],[1,5],[0,3],[1,1]]
const RADAR_ARMS: Pixels[] = [
  [[3,2],[3,1]],  // N
  [[4,2]],        // NE
  [[4,3],[5,3]],  // E
  [[4,4]],        // SE
  [[3,4],[3,5]],  // S
  [[2,4]],        // SW
  [[2,3],[1,3]],  // W
  [[2,2]],        // NW
]
function renderRadar(tick: number): Pixels {
  const dir = Math.floor(tick / 3) % 8
  return [[3,3], ...RADAR_RING, ...RADAR_ARMS[dir]]
}

// ── Wave: three dots with staggered sinusoidal bounce — chat typing indicator
function renderWave(tick: number): Pixels {
  const cycle = 18
  return ([1, 3, 5] as number[]).map((x, i) => {
    const t = (tick - i * 6 + cycle * 10) % cycle
    const phase = (t / cycle) * Math.PI * 2
    const y = cl(5 - Math.round(Math.max(0, Math.sin(phase)) * 2))
    return [x, y] as [number, number]
  })
}

// ── Cog: 4-tooth gear alternating between + and × tooth positions ─────────
const COG_BODY: Pixels = [
  [2,2],[3,2],[4,2],[5,2],
  [2,3],[5,3],
  [2,4],[5,4],
  [2,5],[3,5],[4,5],[5,5],
  [3,3],[4,3],[3,4],[4,4],
]
const COG_TEETH: Pixels[] = [
  [[3,0],[4,0],[7,3],[7,4],[3,7],[4,7],[0,3],[0,4]],  // N/E/S/W
  [[6,0],[7,1],[6,7],[7,6],[0,6],[1,7],[0,1],[1,0]],  // NE/SE/SW/NW
]
function renderCog(tick: number): Pixels {
  return [...COG_BODY, ...COG_TEETH[Math.floor(tick / 3) % 2]]
}

// ── Ping: center dot emits expanding diamond rings at intervals ───────────
function renderPing(tick: number): Pixels {
  const period = 24
  const t = tick % period
  const pixels: Pixels = [[3,3]]
  if (t < 6) {
    const r = t < 2 ? 1 : t < 4 ? 2 : 3
    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 8; y++)
        if (Math.abs(x - 3) + Math.abs(y - 3) === r) pixels.push([x, y])
  }
  return pixels
}

// ── Clock: ring face with minute hand (fast) and hour hand (slow) ─────────
const CLOCK_RING: Pixels = [[3,0],[5,1],[6,3],[5,5],[3,6],[1,5],[0,3],[1,1]]
const CLOCK_HANDS: Pixels[] = [
  [[3,2],[3,1]],  // N
  [[4,2],[5,1]],  // NE
  [[4,3],[5,3]],  // E
  [[4,4],[5,5]],  // SE
  [[3,4],[3,5]],  // S
  [[2,4],[1,5]],  // SW
  [[2,3],[1,3]],  // W
  [[2,2],[1,1]],  // NW
]
function renderClock(tick: number): Pixels {
  const minuteDir = Math.floor(tick / 6) % 8
  const hourDir = Math.floor(tick / 48) % 8
  return [[3,3], ...CLOCK_RING, ...CLOCK_HANDS[minuteDir], CLOCK_HANDS[hourDir][0]]
}

// ── Step: three dots fill left-to-right then drain left-to-right ──────────
function renderStep(tick: number): Pixels {
  const cycle = 24
  const t = tick % cycle
  const dots: Pixels = [[2,4],[4,4],[6,4]]
  const pixels: Pixels = []
  if (t < 9) {
    const n = Math.floor(t / 3) + 1
    for (let i = 0; i < Math.min(n, 3); i++) pixels.push(dots[i])
  } else if (t < 18) {
    const gone = Math.floor((t - 9) / 3) + 1
    for (let i = gone; i < 3; i++) pixels.push(dots[i])
  }
  return pixels
}

// ── Fill: 8-point ring fills clockwise, holds complete, then resets ───────
const FILL_RING: Pixels = [[3,0],[5,1],[6,3],[5,5],[3,6],[1,5],[0,3],[1,1]]
function renderFill(tick: number): Pixels {
  const cycle = 32
  const t = tick % cycle
  if (t >= 28) return []
  if (t >= 24) return [...FILL_RING]
  return FILL_RING.slice(0, Math.floor(t / 3))
}

// ── Grow: three columns grow from bottom to different heights, hold, reset ─
function renderGrow(tick: number): Pixels {
  const cycle = 32
  const t = tick % cycle
  const pixels: Pixels = []
  for (const [col, maxH] of [[2,5],[4,7],[6,4]] as [number,number][]) {
    const h = t < 20 ? Math.round((t / 20) * maxH) : t < 28 ? maxH : 0
    for (let dy = 0; dy < h; dy++) pixels.push([col, 7 - dy])
  }
  return pixels
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
  { name: 'Ghost',    render: renderGhost    },
  { name: 'Breath',   render: renderBreath   },
  { name: 'Drip',     render: renderDrip     },
  { name: 'Bubble',   render: renderBubble   },
  { name: 'Hourglass',render: renderHourglass},
  { name: 'Ripple',   render: renderRipple   },
  { name: 'Tide',     render: renderTide     },
  { name: 'Signal',   render: renderSignal   },
  { name: 'Focus',    render: renderFocus    },
  { name: 'Campfire', render: renderCampfire },
  { name: 'Firefly',  render: renderFirefly  },
  { name: 'Bloom',    render: renderBloom    },
  { name: 'Flutter',  render: renderFlutter  },
  { name: 'Aurora',   render: renderAurora   },
  { name: 'Surf',     render: renderSurf     },
  { name: 'Invader',  render: renderInvader  },
  { name: 'Pac',      render: renderPac      },
  { name: 'Pong',     render: renderPong     },
  { name: 'Neko',     render: renderNeko     },
  { name: 'Worm',     render: renderWorm     },
  { name: 'Face',       render: renderFace       },
  { name: 'TabulaRasa',  render: renderTabulaRasa  },
  { name: 'Tamagotchi', render: renderTamagotchi },
  { name: 'Cursor', render: renderCursor },
  { name: 'Arc',    render: renderArc    },
  { name: 'Neural', render: renderNeural },
  { name: 'Think',  render: renderThink  },
  { name: 'Loader', render: renderLoader },
  { name: 'Radar',  render: renderRadar  },
  { name: 'Wave',   render: renderWave   },
  { name: 'Cog',    render: renderCog    },
  { name: 'Ping',   render: renderPing   },
  { name: 'Clock',  render: renderClock  },
  { name: 'Step',   render: renderStep   },
  { name: 'Fill',   render: renderFill   },
  { name: 'Grow',   render: renderGrow   },
]
