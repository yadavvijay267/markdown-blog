# Blog Platform with Markdown Support

A lightweight blog where posts are written in Markdown and rendered to HTML,
with tags and search — and the blog is also its own CMS.

## Features

- **Markdown editor with live preview** — write on the left, see the rendered
  post on the right as you type.
- **Own tiny Markdown parser** — headings, bold, italic, inline/block code,
  links, ordered and unordered lists, blockquotes, horizontal rules. No CDN
  dependency, so the blog works fully offline. (The guide suggests Marked.js;
  this build ships a dependency-free parser instead — same result, zero
  network needed.)
- **Tag filtering and full-text search** — filter by tag chip or search
  titles, bodies and tags.
- **Reading-time estimate** (words ÷ 200/min) on every card and post, plus an
  **estimated read progress bar** at the top of the page while reading.
- **Posts saved to localStorage** — your posts survive reloads; nothing is
  sent to any server.
- **Export/import as JSON** — back up all posts, or import a previous export.
- **4 sample posts** included on first visit (fiber QC, vanilla JS, learning
  in public, Open-Meteo).

## Tech stack

JavaScript, localStorage, GitHub Pages. No framework, no build step.

## How to run

Open `src/index.html` in any browser.

```bash
# optional: serve locally
python3 -m http.server --directory src 8002
# then visit http://localhost:8002
```

## Screenshots

See [`screenshots/SCREENSHOTS.md`](screenshots/SCREENSHOTS.md).

## Project structure

```
src/        index.html, styles.css, app.js (parser + store + editor)
assets/     favicon.svg
docs/       ARCHITECTURE.md
tests/      run_tests.py (automated sanity checks) + TESTING.md
```

## License

MIT — see [LICENSE](LICENSE).
