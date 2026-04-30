# Architecture

This document describes how Asmaa is organized, why it is built as a vanilla web app, and how the major pieces fit together. Read this before making non-trivial contributions.

## Goals

- Treat the data as sacred, the runtime as small, and the design as scholarly.
- Boot fast on a slow connection, run on a slow device, and stay legible to anyone reading the source.
- Keep zero dependencies. No build step, no transpiler, no bundler.

## Why vanilla JavaScript

The data set is fixed at 99 entries. The interactive surface is four small views, three languages, two themes, and one daily modal. There is no backend, no real-time data, and no complex state graph that would make a framework pay back its weight.

Vanilla code keeps the bundle to three small files (HTML, CSS, JS) plus the data module. There is nothing to install, nothing to wait for at startup, no version drift on a dependency tree, and no surprise bytes shipped to users. The whole app fits in a single sitting for a new contributor.

This is a deliberate constraint, not a default. Changes that introduce a runtime dependency or a build step will not be merged.

## File map

| File | Role |
| --- | --- |
| `index.html` | Page shell, view containers, daily modal scaffold, Google Fonts, single script tag |
| `styles.css` | Design tokens, layout, components, RTL, motion, breakpoints |
| `script.js` | State, view rendering, audio, persistence, accessibility |
| `names.js` | The 99 names. Religious content. Off-limits except via a verified-source PR |
| `404.html` | Self-contained not-found page; CSS-only theme via `prefers-color-scheme` |
| `vercel.json` | Cache headers and security headers (CSP, HSTS, etc.) |
| `docs/ARCHITECTURE.md` | This file |
| `docs/screenshots/` | README screenshots |

## Module loading

`index.html` loads a single script:

```html
<script src="script.js" type="module"></script>
```

`script.js` imports the data:

```js
import { namesData } from './names.js';
```

Browsers refuse `import` over `file://`, so any local development needs a static server. `python -m http.server 8000` is enough.

## State

A single `appState` object holds:

- `currentLang` (`'en'` | `'ar'` | `'fr'`)
- `currentView` (`'browse'` | `'study'` | `'quiz'` | `'progress'`)
- `currentTheme` (`'light'` | `'dark'`)
- `currentStudyIndex`
- `searchTerm`
- `quizData`
- `progress`

There is no observer, no reactive system, and no dispatcher. Code mutates `appState` and then calls `renderView` (or a more focused render function) explicitly. This is fine because the entire app fits on one page and renders are cheap.

`namesByNumber`, `namesByArabic`, `favoritesSet`, and `learnedSet` are O(1) lookup structures rebuilt by `rebuildLookupSets()` after any mutation to the favorites or learned arrays.

## Persistence

Four keys live in `localStorage`:

- `asmaaTheme` - `'light'` or `'dark'`
- `asmaaLanguage` - `'en'`, `'ar'`, or `'fr'`
- `asmaaProgress` - JSON-encoded progress object
- `lastDailyName` - date string for the daily modal

Every read is guarded:

- `readStorage(key)` wraps `localStorage.getItem` in try/catch (private mode, disabled storage)
- `readTheme()` and `readLanguage()` reject any value that is not in the allowed enum
- `readProgress()` parses the JSON, validates that the result is a plain object, and individually validates each field (arrays of integers in 1..99 for `learned` and `favorites`; finite non-negative numbers for streak, totals, and counters; string for `lastVisit`). Any field that fails validation is replaced with the typed default.

Every write goes through `writeStorage(key, value)` which silently swallows quota and access errors. Persistence is best-effort.

## View system

The page contains four `.view-content` elements that share a CSS rule that hides them by default. `renderView()` toggles the `is-active` class on exactly one of them, which both shows it and runs the staggered fade-in animation. The view-specific render function (`renderNamesGrid`, `renderStudyView`, `startQuiz`, `renderProgress`) is then called.

Tab clicks change `appState.currentView` and call `setActiveTab(name)` which keeps the `active` class and `aria-selected` attribute synchronized across all four nav tabs.

## Internationalization

`translations` is an object keyed by language code. Each language carries every UI string the app uses. `updateUIText()` is called after every render to keep the visible strings in sync with the active language.

The names themselves carry per-language `meaning` and `reflection` fields directly inside `names.js`. They are not part of `translations`.

### Adding a new language

1. Add a new key (for example `tr`) to the `translations` object in `script.js` with every existing key translated.
2. Add a `tr` key under each `meaning` and `reflection` in every entry of `names.js`.
3. Add the new locale to the `<select id="languageSelector">` in `index.html`.
4. Update `readLanguage()` in `script.js` to permit the new code.
5. Test: switch to the new language and verify every visible string renders correctly in all four views.

Translations to or from Arabic, English, or French that touch `names.js` require verified sources per [CONTRIBUTING.md](../CONTRIBUTING.md).

## RTL

When the language changes to Arabic, `applyDirection()` sets `document.documentElement.dir = 'rtl'`, mirrors `lang`, and toggles a `body.rtl` class for legacy selectors.

Every layout rule in `styles.css` uses logical properties (`margin-inline-start`, `inset-inline-end`, `border-inline-start`, `text-align: start`). Physical properties (`left`, `margin-right`) are not used and will be rejected in code review. Latin transliteration text inside an Arabic-language container is wrapped with `dir="ltr"` and `unicode-bidi: isolate` to prevent mid-line flipping.

## Theme

Two themes share variable names. Light is the parchment palette, dark is the deep navy palette. The theme toggle sets `data-theme` on `<body>`, which switches the CSS variables under `[data-theme="dark"]`. `prefers-color-scheme` is the initial fallback when nothing is stored.

The theme palette and full set of design tokens are defined at the top of `styles.css`. See [README.md](../README.md) for the visual concept.

## Audio

Audio uses the Web Speech API. The fallback chain is:

1. `SpeechSynthesisUtterance` with `lang = 'ar-SA'`. If an Arabic voice is installed on the device, that voice is selected.
2. `responsiveVoice.speak(...)` if `responsiveVoice` is globally available. The library is not loaded by Asmaa; this branch exists for forward compatibility if a contributor opts in later.
3. A toast notification with the transliteration and a speaker emoji. This is the final fallback when no synthesizer is reachable.

iOS Safari requires a real user gesture before the speech synthesizer can speak. `initializeAudioForMobile()` runs on the first click or touchstart, primes the synthesizer with a silent zero-volume utterance, and is then locked off.

## Daily-name modal

Once per calendar day, a modal surfaces a name selected by `dayOfYear % 99`. The selection is stored in `localStorage.lastDailyName` as the result of `Date.toDateString()`. On year boundaries the index resets cleanly because `dayOfYear` resets too.

The modal:

- Uses `role="dialog"` and `aria-modal="true"` with an `aria-labelledby` reference to its title
- Saves the previously focused element when it opens, then focuses the close button
- Restores the saved focus when it closes
- Closes on `Escape`, on close-button click, and on backdrop click
- Moves focus out before setting `aria-hidden="true"` so assistive tech does not see a hidden subtree retaining focus

## Security

The app has zero outbound network calls except the initial Google Fonts CSS request. No `fetch`, no `XMLHttpRequest`, no analytics, no telemetry. The CSP in `vercel.json` enforces this (`connect-src 'self'`).

The app builds DOM with `createElement` plus `textContent`. There is no template-string-to-HTML path anywhere in `script.js`. The CSP also blocks any inline `<script>` so an injection that managed to reach the DOM as text would be neutralized.

`SECURITY.md` covers the reporting policy.

## Design system

Token values live at the top of `styles.css` and follow this structure:

- Surface: `--ink-deep`, `--ink-mid`, `--ink-low`
- Accent: `--gold-warm`, `--gold-deep`, `--gold-glow`
- Text: `--ivory`, `--ivory-mute`, `--ivory-fade`
- Lines: `--rule-line`, `--rule-strong`
- Status: `--moss`, `--terracotta`
- Type scale: `--fs-xs` through `--fs-3xl` and Arabic-specific sizes
- Spacing: 8 px base, 4 px micro
- Radius: `--r-0`, `--r-sm`, `--r-md`, `--r-lg`, `--r-pill`
- Shadow: `--elev-1` through `--elev-3`, plus `--glow-gold`
- Motion: `--dur-quick`, `--dur-base`, `--dur-slow`, `--dur-page`, with `--ease-out` and `--ease-in-out`
- Pattern: `--pattern-url` (an inline SVG of an eight-point star, tiled at low opacity on the body)

Cards use `--r-md`, the study card and modal use `--r-lg`, and most other surfaces are sharp. Gold is reserved for numbers, focus, primary state, and the four corner brackets on the study card and modal.

## Motion

Five durations and two easings, no spring physics. Page transitions fade. Browse cards stagger. Hover and active states use the quick duration. `prefers-reduced-motion: reduce` collapses everything to 1 ms.

## Accessibility

- A skip link at the top of the body
- `role="tablist"` and `role="tab"` on the navigation; `aria-selected` synchronized with the active tab
- `role="tabpanel"` on each view
- `role="dialog"` and `aria-modal` on the daily modal with focus management
- `aria-label` on every icon-only or emoji-only control
- 44 by 44 minimum touch targets at every viewport
- A single `:focus-visible` rule that traces the underlying border radius
- `prefers-reduced-motion` honored

## Deployment

The site is hosted on Vercel as a static deployment. `vercel.json` handles the cache strategy (immutable for `styles.css`, `script.js`, and `names.js`; revalidating for HTML) and the security headers. There is no Vercel function, no build command, and no ISR.
