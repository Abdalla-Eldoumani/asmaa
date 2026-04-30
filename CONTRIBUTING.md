# Contributing

Thank you for considering a contribution to Asmaa. The project welcomes pull requests for bug fixes, accessibility improvements, translations, documentation, and visual polish.

This file explains the workflow, the code style, and the one hard rule that governs religious content.

## Religious content rule

`names.js` is the source of truth for the 99 names. The Arabic text, transliterations, English / Arabic / French meanings, and reflections were verified against authenticated Islamic sources.

Pull requests that touch `names.js` must:

1. Cite the verified source for each change in the PR description (scholar, work, page reference, or recognized online corpus)
2. Explain why the existing entry was incorrect or incomplete
3. Limit scope to the entries being corrected; do not bundle stylistic edits with content fixes
4. Be reviewed by the project maintainer before merge

Pull requests that change `names.js` without citing a verified source will not be merged.

## Local setup

Clone the repository and serve it. Modern browsers will not load ES modules from `file://`, so a static server is required:

```bash
git clone https://github.com/Abdalla-Eldoumani/asmaa.git
cd asmaa
python -m http.server 8000
```

Open `http://localhost:8000` and confirm the page loads in light and dark mode and in all three languages.

There is no install step, no build step, and no test suite to configure. The project intentionally has zero runtime and zero build dependencies.

## Code style

- Plain HTML, CSS, and modern JavaScript. No frameworks. No transpilers.
- Indentation: 4 spaces in `script.js`, `styles.css`, `index.html`, and `404.html`.
- ES modules and `const` / `let` only. No `var`.
- Functions are declared, not assigned. Arrow functions are reserved for callbacks.
- Comments explain why the code exists, not what it does. Self-documenting names are preferred.
- No third-party scripts or stylesheets without prior discussion in an issue.
- Logical CSS properties (`margin-inline-start`, `inset-inline-end`, etc.) are mandatory. Physical properties (`margin-left`, `right`) break RTL.
- Every `localStorage` read goes through `readStorage`. Every parsed value is shape-validated.
- DOM is constructed with `createElement` plus `textContent` or `replaceChildren`. Avoid `innerHTML` when the source could ever include user-controlled or storage-controlled data.

## Commit conventions

- One logical change per commit.
- Commit subject is lowercase, imperative, and short. Aim for under 70 characters. Examples:
  - `add aria-current to nav tabs`
  - `fix focus order on modal close`
  - `update arabic transliteration for entry 47`
- Commit body, when present, explains why. The diff already shows what.
- Do not bundle unrelated changes. If a fix uncovers a refactor opportunity, open a separate PR.

## Pull request process

1. Fork the repository and create a topic branch from `master`.
2. Make focused commits.
3. Run a local sanity pass before opening the PR:
   - Browse, Study, Quiz, and Progress views render in all three languages
   - Light and dark themes both work
   - The page has no console errors and no console warnings at any breakpoint
   - `git diff master -- names.js` is empty unless your PR is a content correction
4. Open the PR with a clear title and a description that covers what changed and why.
5. The maintainer will review. Expect feedback within a week. Larger or content-related PRs may take longer.

## What contributions are welcome

- Accessibility fixes (focus management, ARIA, keyboard support, screen reader correctness)
- Performance improvements that do not introduce dependencies
- New translations (Spanish, Urdu, Turkish, Indonesian, etc.) added as additional locale keys in the `translations` object and `meaning` / `reflection` per name (this requires a verified source per the religious content rule)
- Visual polish that respects the existing design system (see `.agent/DESIGN_SYSTEM.md` if you have local access; otherwise see `docs/ARCHITECTURE.md` for a public summary)
- Documentation, examples, screenshots, and onboarding improvements
- Bug fixes with a clear reproduction
- New views or features that pass an issue-first design discussion

## What contributions are unlikely to be merged

- Framework migrations (React, Vue, Svelte, Next.js, etc.). The vanilla architecture is intentional.
- Build pipelines (Webpack, Vite, Rollup, esbuild). Same reason.
- Runtime dependencies (npm packages used at request time). The project ships zero dependencies.
- New analytics, telemetry, or third-party trackers.
- Cosmetic changes that drift from the manuscript-illumination design language.
- Bulk reformatting that mixes structural changes with whitespace.

## Reporting bugs

Open an issue with:

- A short description
- The affected view, language, theme, and viewport size
- Steps to reproduce
- Expected vs. actual behavior
- Browser and operating system

Screenshots help.

## Reporting security issues

Do not open a public issue. See [SECURITY.md](SECURITY.md).

## Code of conduct

By contributing, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
