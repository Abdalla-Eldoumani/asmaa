# Asmaa - 99 Names of Allah Learning App

A web application for learning and memorizing the 99 Names of Allah (Asma ul-Husna) with support for Arabic, English, and French.

## Features

- Browse all 99 names with Arabic text, transliteration, and meanings
- Study mode with reflections and audio pronunciation
- Interactive quiz with randomized multiple-choice questions
- Progress tracking with statistics, streaks, and favorites
- Daily name reminder
- Dark and light themes
- Responsive layout for desktop, tablet, and mobile
- Full RTL support for the Arabic interface

## Live Demo

[https://asmaa-alpha.vercel.app/](https://asmaa-alpha.vercel.app/)

## Setup

```bash
git clone https://github.com/Abdalla-Eldoumani/asmaa.git
cd asmaa
open index.html
```

No build process or dependencies required. For features that use ES modules, serve locally:

```bash
python -m http.server 8000
# or
npx serve .
```

## Project Structure

```
asmaa/
├── index.html        # Main HTML file
├── styles.css        # Styling and themes
├── script.js         # Application logic
├── names.js          # 99 names with translations
├── LICENSE           # MIT License
└── README.md
```

## Technologies

- Vanilla JavaScript (no frameworks or dependencies)
- CSS3 with custom properties for theming
- Web Speech API for Arabic text-to-speech
- LocalStorage for progress and preferences

## License

MIT License — see [LICENSE](LICENSE) for details.

## Author

Abdalla Eldoumani

---

*"He is Allah: the Creator, the Inventor, the Shaper. He alone has the Most Beautiful Names."* — Quran 59:24
