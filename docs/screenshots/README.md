# Screenshots

This directory holds screenshots referenced from the project [README](../../README.md).

Captured at three widths in both themes:

- `375x812` - small phone
- `768x1024` - tablet
- `1440x900` - desktop

For each width, screenshots are taken in both light and dark themes across the four views (Browse, Study, Quiz, Progress) plus the daily-name modal. Arabic RTL captures are included where layout differs meaningfully.

Filenames follow the pattern: `{view}-{theme}-{width}-{lang}.png`, for example `browse-dark-1440-en.png` or `study-light-375-ar.png`.

## Regenerating

The screenshots are produced via Playwright. To regenerate locally:

```bash
python -m http.server 8000
# then drive Playwright at http://localhost:8000 with the desired viewports
```

Save outputs into this directory, replacing any stale captures.
