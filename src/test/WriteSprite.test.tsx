import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { WriteSprite } from '../WriteSprite'

describe('WriteSprite', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders an SVG element', () => {
    const { container } = render(<WriteSprite text="HI" />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('has role="img"', () => {
    render(<WriteSprite text="HI" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('aria-label includes the text prop verbatim', () => {
    render(<WriteSprite text="HELLO" />)
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', 'Writing: HELLO')
  })

  it('applies the default size of 16', () => {
    const { container } = render(<WriteSprite text="A" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('respects a custom size', () => {
    const { container } = render(<WriteSprite text="A" size={32} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
  })

  it('renders exactly 64 rect elements in LED matrix mode', () => {
    const { container } = render(
      <WriteSprite text="A" color={['#00ff88', '#1a2a1a']} />
    )
    expect(container.querySelectorAll('rect')).toHaveLength(64)
  })

  it('renders exactly 64 circle elements in LED matrix mode with shape="dot"', () => {
    const { container } = render(
      <WriteSprite text="A" color={['#00ff88', '#1a2a1a']} shape="dot" />
    )
    expect(container.querySelectorAll('circle')).toHaveLength(64)
    expect(container.querySelectorAll('rect')).toHaveLength(0)
  })

  it('does not advance animation when active=false', () => {
    const { container } = render(<WriteSprite text="HI" active={false} />)
    const before = container.innerHTML
    act(() => { vi.advanceTimersByTime(500) })
    expect(container.innerHTML).toBe(before)
  })

  it('silently skips characters not in font (no crash)', () => {
    expect(() => render(<WriteSprite text="HELLO 🎉 WORLD" />)).not.toThrow()
  })

  it('is case-insensitive: lowercase and uppercase render identical pixel shapes', () => {
    const { container: lower } = render(
      <WriteSprite text="hi" color={['#fff', '#000']} />
    )
    const { container: upper } = render(
      <WriteSprite text="HI" color={['#fff', '#000']} />
    )
    // Compare fill attributes of all rects (pixel state), not full innerHTML
    // (aria-label differs due to raw text prop)
    const lowerFills = Array.from(lower.querySelectorAll('rect')).map(r => r.getAttribute('fill'))
    const upperFills = Array.from(upper.querySelectorAll('rect')).map(r => r.getAttribute('fill'))
    expect(lowerFills).toEqual(upperFills)
  })
})
