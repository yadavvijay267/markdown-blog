// Markdown Blog — original vanilla JS.
// Own tiny Markdown parser (no CDN dependency, works offline), post store
// in localStorage, tag filter, full-text search, reading time, read progress,
// live-preview editor, JSON export/import.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var KEY = "markdown-blog-posts-v1";

  /* ---------------- Sample posts (seeded on first visit) ---------------- */
  var SEED = [
    {
      id: "hello-fiber-qc",
      title: "What a QC Engineer actually checks on a fiber job",
      date: "2026-11-02",
      tags: ["fiber", "telecom", "career"],
      body: "# What a QC Engineer actually checks on a fiber job\n\nPeople picture QC as a clipboard and a frown. On a fiber project it is mostly **checking the boring things before they become expensive things**.\n\n## The three checks that catch 90% of problems\n\n- **Route vs drawing** — does the cable actually follow the approved route?\n- **Splice loss** — every splice tested, every reading recorded, no blanks.\n- **Documentation** — as-built drawings, test sheets and photos filed the same day.\n\n> If it isn't written down, it didn't happen. That is the whole job, really.\n\n## Why it matters\n\nA missed splice today is a 2 a.m. outage in six months. QC is cheap; rework is not. The best compliment I ever got on site was *\"we didn't have to come back.\"*\n\n```\nSplice loss budget: 0.05 dB per splice (target)\nOTDR trace: saved per span, labelled by route ID\n```\n\n[Read more about fiber on Wikipedia](https://en.wikipedia.org/wiki/Optical_fiber)"
    },
    {
      id: "vanilla-js-enough",
      title: "Vanilla JavaScript is still enough (most of the time)",
      date: "2026-10-24",
      tags: ["javascript", "web"],
      body: "# Vanilla JavaScript is still enough (most of the time)\n\nEvery new project tempts you to `npm install` a framework first and think later. But a surprising number of real sites need **none of it**.\n\n## What vanilla handles well\n\n1. **Forms and validation** — a few listeners, done.\n2. **Filters, tabs, accordions** — class toggles and data attributes.\n3. **Fetching an API** — `fetch()` is built in.\n\n## When to reach for a framework\n\nWhen state gets genuinely tangled — collaborative editing, big dashboards, teams of ten. Until then, *less tooling means fewer things to break*.\n\nThis blog is the proof: one HTML file, one CSS file, one JS file, and its own Markdown parser. No build step, no dependencies, and it opens in any browser.\n\n---\n\n**Rule of thumb:** if you can explain the feature in one sentence, you can probably build it in vanilla JS."
    },
    {
      id: "learning-in-public",
      title: "Learning in public: why I build 100 projects",
      date: "2026-10-12",
      tags: ["career", "learning"],
      body: "# Learning in public: why I build 100 projects\n\nA finished small project beats a half-built big one. That is the whole idea behind my 100-project list.\n\n## The rules I set myself\n\n- **One repo per project** — README, screenshots and at least one test.\n- **Original code only** — never copy a tutorial verbatim.\n- **Ship, then move on** — time-boxed, then the next one.\n\n## What it proves\n\nNot that I know everything — that I can *finish things*. Recruiters remember a wall of shipped work far longer than a certificate.\n\n> Done is a skill. Practice it like any other.\n\nIf you are starting out, pick the smallest project on your list and ship it this week. Then do the next one."
    },
    {
      id: "open-meteo-no-key",
      title: "Free weather data with no API key: Open-Meteo",
      date: "2026-10-05",
      tags: ["javascript", "api", "web"],
      body: "# Free weather data with no API key: Open-Meteo\n\nMost weather APIs want a signup, a key and a credit card \"just in case\". [Open-Meteo](https://open-meteo.com/) asks for none of that.\n\n## The call\n\n```js\nfetch(\"https://api.open-meteo.com/v1/forecast?latitude=28.53&longitude=77.39&current=temperature_2m,weather_code\")\n  .then(r => r.json())\n  .then(d => console.log(d.current.temperature_2m));\n```\n\n## What you get\n\n- **Current temperature and WMO weather code**\n- Hourly and daily forecasts\n- No key, generous free limits\n\n## One gotcha\n\nThe `weather_code` is a number, not a word — `0` is clear sky, `61` is slight rain, `95` is a thunderstorm. Map the codes yourself; it takes ten lines and you control the wording.\n\nI use it on my portfolio to set the accent colour from the live weather. Small touch, big charm."
    }
  ];

  /* ---------------- Store ---------------- */
  function loadPosts() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var p = JSON.parse(raw); if (Array.isArray(p) && p.length) return p; }
    } catch (e) {}
    savePosts(SEED);
    return SEED.slice();
  }
  function savePosts(posts) {
    try { localStorage.setItem(KEY, JSON.stringify(posts)); } catch (e) {}
  }
  var posts = loadPosts();
  var activeTag = "all";
  var editingId = null;

  /* ---------------- Tiny Markdown parser ---------------- */
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function inline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return s;
  }
  function mdToHtml(md) {
    var lines = md.replace(/\r\n/g, "\n").split("\n");
    var out = [], i = 0, inCode = false, codeBuf = [];
    var listBuf = [], listType = null;
    function flushList() {
      if (listBuf.length) {
        out.push("<" + listType + ">" + listBuf.map(function (x) { return "<li>" + inline(x) + "</li>"; }).join("") + "</" + listType + ">");
        listBuf = []; listType = null;
      }
    }
    while (i < lines.length) {
      var line = lines[i];
      if (line.trim().startsWith("```")) {
        if (!inCode) { inCode = true; codeBuf = []; }
        else { inCode = false; out.push("<pre><code>" + esc(codeBuf.join("\n")) + "</code></pre>"); }
        i++; continue;
      }
      if (inCode) { codeBuf.push(line); i++; continue; }
      var h = line.match(/^(#{1,3})\s+(.*)$/);
      var ul = line.match(/^\s*[-*]\s+(.*)$/);
      var ol = line.match(/^\s*\d+\.\s+(.*)$/);
      var q = line.match(/^>\s?(.*)$/);
      if (h) { flushList(); out.push("<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">"); }
      else if (line.trim() === "---") { flushList(); out.push("<hr>"); }
      else if (ul) { if (listType !== "ul") flushList(); listType = "ul"; listBuf.push(ul[1]); }
      else if (ol) { if (listType !== "ol") flushList(); listType = "ol"; listBuf.push(ol[1]); }
      else if (q) { flushList(); out.push("<blockquote>" + inline(q[1]) + "</blockquote>"); }
      else if (line.trim() === "") { flushList(); }
      else { flushList(); out.push("<p>" + inline(line) + "</p>"); }
      i++;
    }
    if (inCode) out.push("<pre><code>" + esc(codeBuf.join("\n")) + "</code></pre>");
    flushList();
    return out.join("\n");
  }

  /* ---------------- Helpers ---------------- */
  function readTime(body) {
    var words = body.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }
  function excerpt(body) {
    var plain = body.replace(/[#>*`\[\]()\-]/g, " ").replace(/\s+/g, " ").trim();
    return plain.length > 180 ? plain.slice(0, 180).trim() + "…" : plain;
  }
  function allTags() {
    var set = {};
    posts.forEach(function (p) { p.tags.forEach(function (t) { set[t] = true; }); });
    return Object.keys(set).sort();
  }
  function show(view) {
    ["listView", "postView", "editorView"].forEach(function (v) { $(v).hidden = v !== view; });
    window.scrollTo(0, 0);
  }

  /* ---------------- List view ---------------- */
  function renderTags() {
    var bar = $("tagBar");
    bar.innerHTML = "";
    var all = document.createElement("button");
    all.className = "tag" + (activeTag === "all" ? " active" : "");
    all.textContent = "All";
    all.type = "button";
    all.addEventListener("click", function () { activeTag = "all"; render(); });
    bar.appendChild(all);
    allTags().forEach(function (t) {
      var b = document.createElement("button");
      b.className = "tag" + (activeTag === t ? " active" : "");
      b.textContent = "#" + t;
      b.type = "button";
      b.addEventListener("click", function () { activeTag = t; render(); });
      bar.appendChild(b);
    });
  }
  function renderList() {
    var q = $("searchBox").value.trim().toLowerCase();
    var filtered = posts.filter(function (p) {
      var tagOk = activeTag === "all" || p.tags.indexOf(activeTag) !== -1;
      var qOk = !q || (p.title + " " + p.body + " " + p.tags.join(" ")).toLowerCase().indexOf(q) !== -1;
      return tagOk && qOk;
    });
    filtered.sort(function (a, b) { return b.date.localeCompare(a.date); });
    $("resultCount").textContent = filtered.length + " post" + (filtered.length === 1 ? "" : "s") +
      (activeTag !== "all" ? " tagged #" + activeTag : "") + (q ? ' matching "' + q + '"' : "");
    var list = $("postList");
    list.innerHTML = "";
    $("noPosts").hidden = filtered.length > 0;
    filtered.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "post-card";
      card.tabIndex = 0;
      card.innerHTML = "<h2></h2><p class='meta'></p><p></p><div class='tags'></div>";
      card.querySelector("h2").textContent = p.title;
      card.querySelector(".meta").textContent = p.date + " · " + readTime(p.body) + " min read";
      card.querySelector("p:not(.meta)").textContent = excerpt(p.body);
      var tagWrap = card.querySelector(".tags");
      p.tags.forEach(function (t) {
        var s = document.createElement("span");
        s.className = "tag"; s.textContent = "#" + t;
        tagWrap.appendChild(s);
      });
      var open = function () { openPost(p.id); };
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) { if (e.key === "Enter") open(); });
      list.appendChild(card);
    });
  }
  function render() { renderTags(); renderList(); }

  /* ---------------- Single post + progress bar ---------------- */
  var currentPost = null;
  function openPost(id) {
    var p = posts.find(function (x) { return x.id === id; });
    if (!p) return;
    currentPost = p;
    $("postTitle").textContent = p.title;
    $("postMeta").textContent = p.date + " · " + readTime(p.body) + " min read";
    $("postTags").innerHTML = "";
    p.tags.forEach(function (t) {
      var s = document.createElement("span");
      s.className = "tag"; s.textContent = "#" + t;
      $("postTags").appendChild(s);
    });
    $("postBody").innerHTML = mdToHtml(p.body);
    show("postView");
  }
  window.addEventListener("scroll", function () {
    if ($("postView").hidden) { $("progressBar").style.width = "0"; return; }
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    $("progressBar").style.width = (max > 0 ? (el.scrollTop / max) * 100 : 0) + "%";
  });

  /* ---------------- Editor ---------------- */
  function openEditor(post) {
    editingId = post ? post.id : null;
    $("editorHeading").textContent = post ? "Edit post" : "Write a post";
    $("edTitle").value = post ? post.title : "";
    $("edTags").value = post ? post.tags.join(", ") : "";
    $("edBody").value = post ? post.body : "";
    updatePreview();
    show("editorView");
  }
  function updatePreview() {
    $("edPreview").innerHTML = mdToHtml($("edBody").value || "*Nothing yet — start typing…*");
    $("edReadTime").textContent = readTime($("edBody").value || "") + " min read";
  }
  $("edBody").addEventListener("input", updatePreview);
  $("newPostBtn").addEventListener("click", function () { openEditor(null); });
  $("editPostBtn").addEventListener("click", function () { if (currentPost) openEditor(currentPost); });
  $("cancelEditBtn").addEventListener("click", function () { show(currentPost ? "postView" : "listView"); });
  $("editorForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var title = $("edTitle").value.trim();
    var body = $("edBody").value.trim();
    if (!title || !body) return;
    var tags = $("edTags").value.split(",").map(function (t) { return t.trim().toLowerCase().replace(/\s+/g, "-"); }).filter(Boolean);
    if (editingId) {
      var p = posts.find(function (x) { return x.id === editingId; });
      p.title = title; p.body = body; p.tags = tags.length ? tags : ["general"];
    } else {
      posts.unshift({ id: "post-" + Date.now(), title: title, body: body, tags: tags.length ? tags : ["general"],
        date: new Date().toISOString().slice(0, 10) });
    }
    savePosts(posts);
    render();
    var saved = editingId ? posts.find(function (x) { return x.id === editingId; }) : posts[0];
    openPost(saved.id);
  });
  $("deletePostBtn").addEventListener("click", function () {
    if (!currentPost) return;
    if (!window.confirm("Delete \"" + currentPost.title + "\"?")) return;
    posts = posts.filter(function (x) { return x.id !== currentPost.id; });
    savePosts(posts);
    currentPost = null;
    render();
    show("listView");
  });

  /* ---------------- Navigation, search, export/import ---------------- */
  $("backBtn").addEventListener("click", function () { show("listView"); });
  $("homeLink").addEventListener("click", function (e) { e.preventDefault(); render(); show("listView"); });
  $("searchBox").addEventListener("input", renderList);
  $("exportBtn").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(posts, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "clamor-blog-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $("importFile").addEventListener("change", function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("not an array");
        var valid = data.filter(function (p) { return p && p.title && p.body; })
          .map(function (p, i) {
            return { id: p.id || "imported-" + Date.now() + "-" + i, title: String(p.title),
              body: String(p.body), tags: Array.isArray(p.tags) ? p.tags : ["general"],
              date: p.date || new Date().toISOString().slice(0, 10) };
          });
        if (!valid.length) throw new Error("no valid posts");
        posts = valid.concat(posts);
        savePosts(posts);
        render();
        alert(valid.length + " post(s) imported.");
      } catch (err) { alert("Import failed: that file is not a valid blog export."); }
      $("importFile").value = "";
    };
    reader.readAsText(file);
  });

  render();
})();
