# Changelog

All notable changes to Asmaa are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.0] - 2026-04-29

This release is a full visual rebuild and a security pass. The architecture (vanilla HTML / CSS / JS, zero dependencies, no build step) is preserved. The 99 names data in `names.js` is unchanged.

### Added

- Manuscript-illumination design system: deep navy and parchment palettes, restrained gold accents, eight-point star (khatim Sulaymani) as the recurring motif
- Cormorant Garamond (display) and Plus Jakarta Sans (body) added to the typography stack alongside Amiri (Arabic)
- Strict Content-Security-Policy via `vercel.json` with `script-src 'self'` and no inline script
- `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, and `Cross-Origin-Resource-Policy` response headers
- Inline SVG favicon
- `aria-current` and `aria-selected` updates on tab change
- `role="dialog"`, `aria-modal`, focus trap, focus restoration, and Escape-to-close on the daily-name modal
- `aria-label` on search bar, theme toggle, modal close, and quiz progress bar
- Skip-to-content link
- `prefers-reduced-motion` collapses transitions and animations to 1 ms
- `prefers-color-scheme` respected as the initial theme when nothing is stored
- Public documentation: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `docs/ARCHITECTURE.md`
- Screenshots at 375, 768, and 1440 widths in both themes under `docs/screenshots/`

### Changed

- All `innerHTML` writes in `script.js` replaced with `createElement` plus `textContent` and `replaceChildren`
- View switching now uses class-based show/hide (`is-active`) instead of inline `display` styles, enabling page-fade transitions
- Card grid uses staggered fade-in via `nth-child` animation delays
- RTL support uses logical CSS properties throughout (`margin-inline-*`, `inset-inline-*`, `border-inline-*`)
- Search input is now `type="search"` with explicit `aria-label`
- 404 page redesigned to match the new visual identity
- 404 page now uses pure `prefers-color-scheme` CSS theming, removing the inline theme-toggle script
- `.gitignore` extended to cover `.agent/`, `**/CLAUDE.md`, `.playwright-mcp/`, and tooling artifacts

### Fixed

- `loadProgress` no longer crashes on tampered or malformed `localStorage` values; reads now go through a guarded `readProgress` with per-field shape validation
- All `localStorage` writes are wrapped in try/catch to handle private mode and quota errors silently
- Modal close no longer leaves focus on a button that is then hidden behind `aria-hidden="true"`; focus is moved before the attribute is set
- RTL physical-property gaps fixed for the study favorite button, modal close, and toast notification

### Removed

- The decorative `.pattern-bg` element (the pattern is now a body backdrop in CSS)
- The unused `playName` window export and its dead wrapper around `playNameAudio`
- Console logging from production paths
- The redundant second `<script>` tag for `names.js` in `index.html`
- Per-element focus overrides scattered through `styles.css` in favor of a single `:focus-visible` rule

### Security

- Added Content-Security-Policy and HSTS headers
- Added shape validation to all `localStorage` reads
- Audit recorded in `.agent/SECURITY_AUDIT.md` (private)

## [1.0.0]

Initial release. Single-page learning tool for the 99 Names of Allah with Browse, Study, Quiz, and Progress views; English, Arabic, and French; light and dark themes; Web Speech API for Arabic pronunciation; localStorage for progress.

[Unreleased]: https://github.com/Abdalla-Eldoumani/asmaa/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Abdalla-Eldoumani/asmaa/releases/tag/v2.0.0
[1.0.0]: https://github.com/Abdalla-Eldoumani/asmaa
