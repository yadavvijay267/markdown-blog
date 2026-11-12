# Testing — Markdown Blog

## Automated checks

```bash
python3 tests/run_tests.py
```

Verifies: file wiring, search/tag/editor/preview/progress/export/import
elements, 4 seed posts, the Markdown parser (with HTML escaping),
localStorage use, reading-time logic, and balanced braces/parens in `app.js`.

## Manual checklist

- [ ] Open `src/index.html`: 4 sample posts listed with dates and read times.
- [ ] Click a tag chip — only matching posts show; click "All" to reset.
- [ ] Search "fiber" — only the fiber post shows.
- [ ] Open a post: progress bar grows as you scroll; reading time shown.
- [ ] Click "+ Write a post": type `# Test` + `**bold**` — preview renders a heading and bold text live.
- [ ] Publish — the new post appears at the top of the list; reload the page — it is still there.
- [ ] Edit the post, then delete it (confirm dialog appears).
- [ ] Export JSON — a file downloads; Import it back — posts are added.
- [ ] Resize to 390px: editor stacks into one column.
