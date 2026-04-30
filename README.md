# Asmaa

A web app for learning the 99 Beautiful Names of Allah (Asma ul-Husna). It provides a browseable grid of every name in Arabic with transliteration and meaning, a focused study mode with a short reflection on each name, an interactive ten-question quiz, and a progress view that tracks favorites, learned names, daily streak, and quiz accuracy.

The interface supports English, Arabic (with full RTL layout), and French. It works in light and dark themes.

## Live demo

[asmaa-alpha.vercel.app](https://asmaa-alpha.vercel.app/)

## Screenshots

Screenshots live in [`docs/screenshots/`](docs/screenshots/) and are captured at 375, 768, and 1440 widths in both themes.

## Features

- All 99 names in authenticated Arabic with diacritics, transliteration, English / Arabic / French meanings, and a short reflection per language
- Browse view with debounced search across name, transliteration, meaning, and number
- Study view with reflections, prev / next navigation, keyboard shortcuts, and audio pronunciation via the Web Speech API
- Quiz view with ten randomized multiple-choice questions and immediate feedback
- Progress view with daily streak, total names learned, quiz accuracy, and favorites
- A daily-name modal that surfaces one name per calendar day
- Light and dark themes anchored on a manuscript-illumination palette
- Full RTL layout for Arabic
- Zero runtime dependencies, no build step

## Tech choices

The app is plain HTML, CSS, and modern JavaScript served as a static site. There is no framework, no bundler, no transpiler, and no `package.json`.

This is a deliberate choice. The data set is fixed at 99 entries, the app has four small views, and the interactive surface is small. Vanilla code is faster to load, easier to read in a single sitting, easier to fork, and easier to keep around without the maintenance overhead of a JavaScript build pipeline. New contributors can clone the repo and edit `script.js` in the browser without any tooling.

## Quick start

Clone and open the page locally:

```bash
git clone https://github.com/Abdalla-Eldoumani/asmaa.git
cd asmaa
```

Modern browsers refuse to load ES modules from `file://`, so serve the directory:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in any modern browser. No install step, no compile step.

## Project structure

```
asmaa/
├── index.html              # Main page shell with all view containers
├── styles.css              # Design system tokens, layout, and components
├── script.js               # State, view rendering, audio, persistence
├── names.js                # The 99 names, immutable religious content
├── 404.html                # Custom not-found page (Al-Hadi theme)
├── vercel.json             # Cache and security headers
├── docs/
│   ├── ARCHITECTURE.md     # How the pieces fit together
│   └── screenshots/        # README screenshots at 375/768/1440
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
└── LICENSE
```

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

The most important rule is documented there in full: `names.js` contains religious content and is reviewed by hand. Any change to that file must cite verified sources.

For broader context on architecture, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Security

To report a vulnerability, see [SECURITY.md](SECURITY.md).

## Attribution

The Arabic text, transliterations, meanings, and reflections were compiled and verified against established Islamic scholarship. The visual identity draws on Mamluk and Ottoman manuscript illumination traditions: deep ink-blue grounds, restrained ivory text, gold reserved for moments of weight, and the eight-point star (khatim Sulaymani) as the recurring motif.

Typography:

- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) by Catharsis Fonts
- [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) by Tokotype
- [Amiri](https://fonts.google.com/specimen/Amiri) by Khaled Hosny

## License

[MIT](LICENSE).

## Author

Abdalla Eldoumani.

> "He is Allah, the Creator, the Inventor, the Fashioner; to Him belong the most beautiful names." (Quran 59:24)
