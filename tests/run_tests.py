#!/usr/bin/env python3
"""Automated sanity checks for the Markdown Blog project.

Run:  python3 tests/run_tests.py
Exit code 0 = all checks passed.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
failures = []


def check(name, ok):
    print(("PASS " if ok else "FAIL ") + name)
    if not ok:
        failures.append(name)


html = (SRC / "index.html").read_text(encoding="utf-8")
css = (SRC / "styles.css").read_text(encoding="utf-8")
js = (SRC / "app.js").read_text(encoding="utf-8")

check("index.html links styles.css", 'href="styles.css"' in html)
check("index.html loads app.js", 'src="app.js"' in html)
check("search box present", 'id="searchBox"' in html)
check("tag bar present", 'id="tagBar"' in html)
check("editor view present", 'id="editorView"' in html)
check("live preview pane present", 'id="edPreview"' in html)
check("progress bar present", 'id="progressBar"' in html)
check("export/import present", 'id="exportBtn"' in html and 'id="importFile"' in html)
check("4 seed posts in JS", js.count('id: "') >= 4)
check("JS has Markdown parser", "mdToHtml" in js and "function inline" in js)
check("JS escapes HTML before parsing", "function esc" in js)
check("JS uses localStorage", "localStorage" in js)
check("JS has reading-time logic", "readTime" in js)
check("JS has search + tag filter", "activeTag" in js and "searchBox" in js)
check("JS braces balanced", js.count("{") == js.count("}"))
# Raw paren counting is invalid here: app.js contains regex literals with
# parentheses inside character classes, so verify syntax with node instead.
import shutil, subprocess
if shutil.which("node"):
    check("JS parses (node --check)", subprocess.run(
        ["node", "--check", str(SRC / "app.js")]).returncode == 0)
else:
    print("SKIP JS parses (node not installed)")
check("README exists", (ROOT / "README.md").exists())
check("LICENSE exists", (ROOT / "LICENSE").exists())

print(f"\n{len(failures)} failure(s).")
sys.exit(1 if failures else 0)
