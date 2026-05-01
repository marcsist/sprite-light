# Changelog

All notable changes to sprite-lite are documented here.

## [0.1.1] - 2026-04-13

### Added
- `shape` prop on `ThinkingSprite` and `WriteSprite` — pass `shape="dot"` to render round circles instead of square pixels, giving a lite-brite peg-board look
- `dotRadius` prop — controls circle radius in SVG units (0–0.5, default 0.38); smaller values add more spacing between dots
- Demo playground: "Dot shape (lite brite)" checkbox and a live dot-size slider that appears when dot mode is active
- `WriteSprite` component — spells out text letter by letter with a sweeping radial reveal animation; supports A–Z, 0–9, and punctuation
- 21 new animation variants: Ghost, Breath, Drip, Bubble, Hourglass, Ripple, Tide, Signal, Focus, Campfire, Firefly, Bloom, Flutter, Aurora, Surf, Invader, Pac, Pong, Neko, Worm, Face

### Changed
- LED matrix pixel lookup switched from string-keyed `Set` to flat `Uint8Array` — eliminates per-tick string allocation
- `pool` resolved once per render instead of inside each event handler
- Demo variant count is now dynamic (tracks actual `VARIANTS` array length)
- Speed slider range tightened to 30–150ms/tick
- Color pickers exposed in demo when LED matrix mode is on

## [0.1.0] - 2026-04-11

Initial release — `ThinkingSprite` with 20 animation variants, 8×8 SVG pixel art, zero dependencies.
