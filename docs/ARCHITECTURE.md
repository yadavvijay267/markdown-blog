# Architecture — Markdown Blog

## Layout

- `src/index.html` — header (search, Write / Export / Import), tag bar,
  three views: post list, single post, editor. Only one view is visible.
- `src/styles.css` — clean editorial look; editor is a two-column grid
  (Markdown left, live preview right) collapsing to one column on phones.
- `src/app.js` — one IIFE with four parts: seed data + store, Markdown
  parser, list/post rendering, editor + export/import.

## The Markdown parser (`mdToHtml`)

A small line-based parser, written for this project:

1. Lines are scanned once. Fenced code blocks (` ``` `) are collected raw
   and HTML-escaped — nothing inside them is parsed.
2. Headings (`#`–`###`), horizontal rules, blockquotes and list items are
   matched by regex; consecutive list items are grouped into one `<ul>`/`<ol>`.
3. Everything else non-empty becomes a `<p>`.
4. Inline formatting runs on each line's text: escaped first, then inline
   code, bold, italic, and `http(s)` links (opened in a new tab with
   `rel="noopener"`).

Escaping runs before any formatting, so a post can never inject HTML.

## The store

Posts live in `localStorage` under `markdown-blog-posts-v1`. On first visit
the 4 seed posts are saved there. Every create/edit/delete/export/import
goes through `savePosts()` so the list and storage never drift. Export
downloads a JSON file via a Blob URL; import validates the file (must be an
array of posts with a title and body) and prepends the valid posts.

## Reading time & progress

Reading time = words ÷ 200 per minute, minimum 1. The progress bar listens
to `scroll` while a post is open and sets its width to
`scrollTop / (scrollHeight - clientHeight)`.

## Deployment

Any static host — GitHub Pages, Netlify, Cloudflare Pages. Posts are
per-browser (localStorage), so each reader has their own copy of the blog.
