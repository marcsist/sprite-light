import { describe, it, expect } from 'vitest'
import { VARIANTS, type VariantName, type Pixels } from '../variants'

function pixelsAreValid(pixels: Pixels): boolean {
  return pixels.every(([x, y]) => x >= 0 && x <= 7 && y >= 0 && y <= 7)
}

describe('VARIANTS registry', () => {
  it('exports exactly 41 variants', () => {
    expect(VARIANTS).toHaveLength(41)
  })

  it('first variant is EKG (fallback)', () => {
    expect(VARIANTS[0].name).toBe('EKG')
  })

  it('all variant names are unique', () => {
    const names = VARIANTS.map((v) => v.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every render function returns valid 8×8 coordinates at tick 0', () => {
    for (const { name, render } of VARIANTS) {
      const pixels = render(0)
      expect(pixelsAreValid(pixels), `${name} returned out-of-bounds pixels at tick 0`).toBe(true)
    }
  })

  it('every render function returns valid coordinates at various ticks', () => {
    const ticks = [1, 10, 50, 100, 255]
    for (const { name, render } of VARIANTS) {
      for (const tick of ticks) {
        const pixels = render(tick)
        expect(pixelsAreValid(pixels), `${name} at tick ${tick}`).toBe(true)
      }
    }
  })

  it('EKG renders 8 pixels per tick (one per column)', () => {
    expect(VARIANTS.find(v => v.name === 'EKG')!.render(0)).toHaveLength(8)
    expect(VARIANTS.find(v => v.name === 'EKG')!.render(42)).toHaveLength(8)
  })

  it('Bounce renders exactly 1 pixel per tick', () => {
    const bounce = VARIANTS.find(v => v.name === 'Bounce')!
    for (const tick of [0, 5, 13]) {
      expect(bounce.render(tick)).toHaveLength(1)
    }
  })

  it('Snake renders exactly 3 pixels per tick', () => {
    const snake = VARIANTS.find(v => v.name === 'Snake')!
    expect(snake.render(0)).toHaveLength(3)
    expect(snake.render(20)).toHaveLength(3)
  })

  it('Binary renders 8 pixels per tick', () => {
    const binary = VARIANTS.find(v => v.name === 'Binary')!
    expect(binary.render(0)).toHaveLength(8)
    expect(binary.render(99)).toHaveLength(8)
  })
})

describe('VariantName coverage', () => {
  const expectedNames: VariantName[] = [
    'EKG', 'Rain', 'Snake', 'Bounce', 'Sine', 'Scan', 'Binary', 'Morse',
    'Weave', 'Spark', 'Spiral', 'Pulse', 'DNA', 'Pendulum', 'Glitch',
    'Orbit', 'Life', 'Stairs', 'Bars', 'Spin', 'Ghost',
    'Breath', 'Drip', 'Bubble',
    'Hourglass', 'Ripple', 'Tide', 'Signal', 'Focus',
    'Campfire', 'Firefly', 'Bloom', 'Flutter', 'Aurora', 'Surf',
    'Invader', 'Pac', 'Pong', 'Neko', 'Worm', 'Face',
  ]

  it('registry contains every VariantName', () => {
    const registeredNames = VARIANTS.map(v => v.name)
    for (const name of expectedNames) {
      expect(registeredNames).toContain(name)
    }
  })
})
