import { useState } from 'react'
import { ThinkingSprite } from './ThinkingSprite'
import { VARIANTS, type VariantName } from './variants'

const ALL_NAMES = VARIANTS.map((v) => v.name)

export function Demo() {
  const [size, setSize] = useState(32)
  const [speed, setSpeed] = useState(90)
  const [active, setActive] = useState(true)
  const [ledMode, setLedMode] = useState(false)
  const [lockedVariant, setLockedVariant] = useState<VariantName | undefined>(undefined)
  const [selectedSubset, setSelectedSubset] = useState<Set<VariantName>>(new Set())

  const color: string | [string, string] | undefined = ledMode
    ? ['#00ff88', '#1a2a1a']
    : undefined

  const subsetArray: VariantName[] | undefined =
    selectedSubset.size > 0 ? [...selectedSubset] : undefined

  function toggleSubset(name: VariantName) {
    setSelectedSubset((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>ThinkingSprite</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Zero-dependency 8×8 pixel-art animation component for React.
      </p>

      {/* Controls */}
      <section style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Size: {size}px</span>
          <input type="range" min={8} max={128} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Speed: {speed}ms/tick</span>
          <input type="range" min={30} max={500} step={10} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={ledMode} onChange={(e) => setLedMode(e.target.checked)} />
          LED matrix mode
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>Lock variant</span>
          <select
            value={lockedVariant ?? ''}
            onChange={(e) => setLockedVariant((e.target.value as VariantName) || undefined)}
          >
            <option value="">— cycle —</option>
            {ALL_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </section>

      {/* Live preview */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Preview</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ThinkingSprite
            size={size}
            speed={speed}
            active={active}
            color={color}
            variant={lockedVariant}
            variants={subsetArray}
          />
          <span style={{ color: '#888', fontSize: '0.85rem' }}>
            {lockedVariant ? `locked: ${lockedVariant}` : subsetArray ? `cycling: ${subsetArray.join(', ')}` : 'cycling all 20'}
          </span>
        </div>
      </section>

      {/* All 20 variants grid */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>All 20 variants (click to lock)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '1rem' }}>
          {ALL_NAMES.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: 8,
                borderRadius: 8,
                background: lockedVariant === name ? '#1a1a2e' : 'transparent',
                cursor: 'pointer',
                border: lockedVariant === name ? '1px solid #00ff88' : '1px solid #222',
              }}
              onClick={() => setLockedVariant(lockedVariant === name ? undefined : name)}
            >
              <ThinkingSprite
                size={32}
                speed={speed}
                active={active}
                color={color}
                variant={name}
              />
              <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Subset cycling */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Subset cycling</h2>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Check variants to cycle through a custom subset. Clear lock variant above first.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {ALL_NAMES.map((name) => (
            <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={selectedSubset.has(name)}
                onChange={() => toggleSubset(name)}
              />
              {name}
            </label>
          ))}
        </div>
      </section>

      {/* Keyboard focus demo */}
      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Keyboard navigation</h2>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Tab to focus, Enter or Space to cycle. Lock a variant above to make it non-interactive.
        </p>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {(['EKG', 'DNA', 'Pulse'] as VariantName[]).map((name) => (
            <ThinkingSprite key={name} size={24} speed={speed} active={active} color={color} variant={name} />
          ))}
          <span style={{ color: '#555', fontSize: '0.8rem' }}>← locked (no tab stop)</span>
          <ThinkingSprite size={24} speed={speed} active={active} color={color} />
          <span style={{ color: '#555', fontSize: '0.8rem' }}>← interactive (tab stop)</span>
        </div>
      </section>
    </div>
  )
}
