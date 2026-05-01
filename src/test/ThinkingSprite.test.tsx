import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThinkingSprite } from '../ThinkingSprite'

describe('ThinkingSprite', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an SVG element', () => {
    const { container } = render(<ThinkingSprite variant="EKG" />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('has role="img" when variant prop is set', () => {
    render(<ThinkingSprite variant="EKG" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('has role="button" when cycling (no variant prop)', () => {
    render(<ThinkingSprite />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('aria-label says "Thinking: {name}" when active', () => {
    render(<ThinkingSprite variant="DNA" active={true} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Thinking: DNA')
  })

  it('aria-label says "Paused: {name}" when active=false', () => {
    render(<ThinkingSprite variant="DNA" active={false} />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Paused: DNA')
  })

  it('renders rect elements by default (square shape)', () => {
    const { container } = render(<ThinkingSprite variant="EKG" />)
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0)
  })

  it('renders circle elements when shape="dot" (non-LED mode)', () => {
    const { container } = render(<ThinkingSprite variant="EKG" shape="dot" />)
    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('rect')).toHaveLength(0)
  })

  it('renders exactly 64 rect elements in LED matrix mode', () => {
    const { container } = render(
      <ThinkingSprite variant="EKG" color={['#00ff88', '#1a2a1a']} />
    )
    expect(container.querySelectorAll('rect')).toHaveLength(64)
  })

  it('renders exactly 64 circle elements in LED matrix mode with shape="dot"', () => {
    const { container } = render(
      <ThinkingSprite variant="EKG" color={['#00ff88', '#1a2a1a']} shape="dot" />
    )
    expect(container.querySelectorAll('circle')).toHaveLength(64)
  })

  it('applies the default size of 16', () => {
    const { container } = render(<ThinkingSprite variant="EKG" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('respects a custom size', () => {
    const { container } = render(<ThinkingSprite variant="EKG" size={48} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('48')
    expect(svg.getAttribute('height')).toBe('48')
  })

  it('does not advance animation when active=false', () => {
    const { container } = render(<ThinkingSprite variant="EKG" active={false} />)
    const before = container.innerHTML
    act(() => { vi.advanceTimersByTime(500) })
    expect(container.innerHTML).toBe(before)
  })

  it('advances animation when active=true', () => {
    const { container } = render(<ThinkingSprite variant="Sine" active={true} speed={90} />)
    const before = container.innerHTML
    act(() => { vi.advanceTimersByTime(180) })
    expect(container.innerHTML).not.toBe(before)
  })

  it('uses currentColor when no color prop is given', () => {
    const { container } = render(<ThinkingSprite variant="EKG" />)
    const rects = container.querySelectorAll('rect')
    rects.forEach((r) => {
      expect(r.getAttribute('fill')).toBe('currentColor')
    })
  })

  it('warns and falls back to EKG for an unknown variant', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ThinkingSprite variant={'NONEXISTENT' as any} />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('NONEXISTENT'))
    warn.mockRestore()
  })

  it('has tabIndex=0 when interactive (no variant prop)', () => {
    const { container } = render(<ThinkingSprite />)
    expect(container.querySelector('svg')?.getAttribute('tabindex')).toBe('0')
  })

  it('has tabIndex=-1 when variant is locked', () => {
    const { container } = render(<ThinkingSprite variant="EKG" />)
    expect(container.querySelector('svg')?.getAttribute('tabindex')).toBe('-1')
  })
})
